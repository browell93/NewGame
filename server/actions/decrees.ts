"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function launchHarvestFestivalAction() {
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

  const nextTaxRate = clamp(dashboard.population.taxRate + 2, 0, 100);
  const nextLoyalty = clamp(dashboard.population.loyalty + 1, 0, 100);
  const nextUnrest = clamp(dashboard.population.unrest - 1, 0, 100);

  const { error: popError } = await supabase
    .from("city_population_state")
    .update({ tax_rate: nextTaxRate, loyalty: nextLoyalty, unrest: nextUnrest })
    .eq("city_id", dashboard.city.id);

  if (popError) {
    redirect(`/game?error=${encodeURIComponent(popError.message)}`);
  }

  const { error: decreeError } = await supabase.from("city_decrees").insert({
    city_id: dashboard.city.id,
    decree_key: "harvest_festival",
    loyalty_delta: 1,
    unrest_delta: -1,
    tax_rate_delta: 2,
  });

  if (decreeError) {
    redirect(`/game?error=${encodeURIComponent(decreeError.message)}`);
  }

  revalidatePath("/game");
  redirect("/game?message=Harvest%20festival%20launched.");
}
