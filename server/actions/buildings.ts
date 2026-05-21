"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

export async function queueTownHallUpgradeAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game/buildings?error=City%20not%20found");
  }

  const townHallLevel = dashboard.buildings.find((b) => b.key === "town_hall")?.level ?? 1;
  const targetLevel = townHallLevel + 1;
  const now = new Date();
  const endsAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("city_build_queues").insert({
    city_id: dashboard.city.id,
    building_key: "town_hall",
    target_level: targetLevel,
    status: "queued",
    ends_at: endsAt,
  });

  if (error) {
    redirect(`/game/buildings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game/buildings");
  redirect("/game/buildings?message=Town%20Hall%20upgrade%20queued");
}
