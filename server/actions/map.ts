"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function scoutNextRegionAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const { data: allRegions, error: regionsError } = await supabase
    .from("map_regions")
    .select("key, threat_level")
    .order("threat_level", { ascending: true });
  if (regionsError) redirect(`/game/map?error=${encodeURIComponent(regionsError.message)}`);

  const { data: discoveries, error: discoverError } = await supabase
    .from("player_region_discovery")
    .select("region_key")
    .eq("player_id", user.id);
  if (discoverError) redirect(`/game/map?error=${encodeURIComponent(discoverError.message)}`);

  const found = new Set((discoveries ?? []).map((d: { region_key: string }) => d.region_key));
  const nextRegion = (allRegions ?? []).find((r: { key: string }) => !found.has(r.key));

  if (!nextRegion) redirect("/game/map?message=All%20regions%20already%20scouted");

  const { error } = await supabase.from("player_region_discovery").insert({
    player_id: user.id,
    region_key: nextRegion.key,
  });
  if (error) redirect(`/game/map?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/map");
  redirect("/game/map?message=Region%20scouted");
}
