"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function resolveLatestMarchAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const { data: latestMarch, error: marchError } = await supabase
    .from("city_marches")
    .select("id, troop_quantity, status")
    .eq("player_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (marchError) redirect(`/game/reports?error=${encodeURIComponent(marchError.message)}`);
  if (!latestMarch) redirect("/game/reports?error=No%20marches%20to%20resolve");

  const outcome = latestMarch.troop_quantity >= 20 ? "victory" : "defeat";
  const attackerLosses = outcome === "victory" ? Math.floor(latestMarch.troop_quantity * 0.2) : Math.floor(latestMarch.troop_quantity * 0.6);
  const defenderLosses = outcome === "victory" ? Math.floor(latestMarch.troop_quantity * 0.7) : Math.floor(latestMarch.troop_quantity * 0.2);
  const lootFood = outcome === "victory" ? 300 : 0;

  const { error: insertError } = await supabase.from("march_battle_resolutions").upsert({
    march_id: latestMarch.id,
    player_id: user.id,
    outcome,
    attacker_losses: attackerLosses,
    defender_losses: defenderLosses,
    loot_food: lootFood,
    resolved_at: new Date().toISOString(),
  }, { onConflict: "march_id" });

  if (insertError) redirect(`/game/reports?error=${encodeURIComponent(insertError.message)}`);

  const { error: marchUpdateError } = await supabase
    .from("city_marches")
    .update({ status: "arrived" })
    .eq("id", latestMarch.id)
    .eq("player_id", user.id);

  if (marchUpdateError) redirect(`/game/reports?error=${encodeURIComponent(marchUpdateError.message)}`);

  revalidatePath("/game/reports");
  revalidatePath("/game/map");
  redirect("/game/reports?message=Latest%20march%20resolved");
}
