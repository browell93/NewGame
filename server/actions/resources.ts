"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMissingSupabaseEnvNames } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { projectAccruedResources } from "@/server/services/resource-accrual";

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

  const nextResources = projectAccruedResources({
    snapshot: dashboard.resources,
    lastCollectedAt: dashboard.resourcesLastCollectedAt,
    taxRate: dashboard.population.taxRate,
  });

  const { error } = await supabase
    .from("city_resources")
    .update({
      gold: nextResources.gold,
      food: nextResources.food,
      lumber: nextResources.lumber,
      stone: nextResources.stone,
      iron: nextResources.iron,
      last_collected_at: new Date().toISOString(),
    })
    .eq("city_id", dashboard.city.id);

  if (error) {
    redirect(`/game?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game");
  redirect("/game?message=Resources%20collected");
}
