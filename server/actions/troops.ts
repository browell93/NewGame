"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

export async function queueMilitiaTrainingAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game/troops?error=City%20not%20found");

  const quantity = 25;
  const endsAt = new Date(Date.now() + 45 * 60 * 1000).toISOString();

  const { error } = await supabase.from("city_troop_training_queues").insert({
    city_id: dashboard.city.id,
    troop_type: "militia",
    quantity,
    status: "queued",
    ends_at: endsAt,
  });
  if (error) redirect(`/game/troops?error=${encodeURIComponent(error.message)}`);

  const { data: existing } = await supabase.from("city_troop_stacks").select("quantity").eq("city_id", dashboard.city.id).eq("troop_type", "militia").maybeSingle();
  const nextQty = (existing?.quantity ?? 0) + quantity;
  const { error: stackError } = await supabase
    .from("city_troop_stacks")
    .upsert(
      {
        city_id: dashboard.city.id,
        troop_type: "militia",
        quantity: nextQty,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "city_id,troop_type" },
    );

  if (stackError) {
    redirect(`/game/troops?error=${encodeURIComponent(stackError.message)}`);
  }

  revalidatePath("/game/troops");
  redirect("/game/troops?message=Militia%20training%20queued");
}
