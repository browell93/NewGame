"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMissingSupabaseEnvNames } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { projectCollectableResources } from "@/server/services/resource-accrual";

export async function collectResourcesAction() {
  if (getMissingSupabaseEnvNames().length > 0) {
    redirect("/game");
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in%20to%20collect%20resources.");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);

  if (!dashboard) {
    redirect("/game?error=City%20not%20found");
  }

  const projection = projectCollectableResources({
    snapshot: dashboard.resources,
    fractions: dashboard.resourceFractions,
    lastCollectedAt: dashboard.resourcesLastCollectedAt,
    taxRate: dashboard.population.taxRate,
  });

  const { error } = await supabase
    .from("city_resources")
    .update({
      gold: projection.resources.gold,
      food: projection.resources.food,
      lumber: projection.resources.lumber,
      stone: projection.resources.stone,
      iron: projection.resources.iron,
      gold_fraction: projection.fractions.gold,
      food_fraction: projection.fractions.food,
      lumber_fraction: projection.fractions.lumber,
      stone_fraction: projection.fractions.stone,
      iron_fraction: projection.fractions.iron,
      last_collected_at: projection.nextLastCollectedAt,
    })
    .eq("city_id", dashboard.city.id);

  if (error) {
    redirect(`/game?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game");
  redirect("/game?message=Resources%20collected");
}
