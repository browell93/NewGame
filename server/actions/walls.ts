"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

export async function reinforceWallsAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game/walls?error=City%20not%20found");

  const { data: existing, error: readError } = await supabase
    .from("city_wall_state")
    .select("wall_level, durability_current, durability_max, trap_count")
    .eq("city_id", dashboard.city.id)
    .maybeSingle();

  if (readError) redirect(`/game/walls?error=${encodeURIComponent(readError.message)}`);

  const wallLevel = existing?.wall_level ?? 1;
  const durabilityMax = existing?.durability_max ?? 1000;
  const durabilityCurrent = Math.min(durabilityMax, (existing?.durability_current ?? 1000) + 150);
  const trapCount = (existing?.trap_count ?? 0) + 5;

  const { error } = await supabase.from("city_wall_state").upsert({
    city_id: dashboard.city.id,
    wall_level: wallLevel,
    durability_current: durabilityCurrent,
    durability_max: durabilityMax,
    trap_count: trapCount,
    updated_at: new Date().toISOString(),
  }, { onConflict: "city_id" });

  if (error) redirect(`/game/walls?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/walls");
  redirect("/game/walls?message=Walls%20reinforced");
}
