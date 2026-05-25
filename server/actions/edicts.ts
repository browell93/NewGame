"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function declareTaxReliefAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in.");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game?error=City%20not%20found.");
  }

  const nextTaxRate = clamp(dashboard.population.taxRate - 3, 0, 100);
  const nextLoyalty = clamp(dashboard.population.loyalty + 2, 0, 100);
  const nextUnrest = clamp(dashboard.population.unrest - 1, 0, 100);

  const { error: popError } = await supabase
    .from("city_population_state")
    .update({
      tax_rate: nextTaxRate,
      loyalty: nextLoyalty,
      unrest: nextUnrest,
    })
    .eq("city_id", dashboard.city.id);

  if (popError) {
    redirect(`/game?error=${encodeURIComponent(popError.message)}`);
  }

  const { error: eventError } = await supabase.from("city_edicts").insert({
    city_id: dashboard.city.id,
    edict_key: "tax_relief",
    loyalty_delta: 2,
    unrest_delta: -1,
    tax_rate_delta: -3,
  });

  if (eventError) {
    redirect(`/game?error=${encodeURIComponent(eventError.message)}`);
  }

  revalidatePath("/game");
  redirect("/game?message=Tax%20relief%20declared.");
}
