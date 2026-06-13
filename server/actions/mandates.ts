"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function issueCivicServiceMandateAction() {
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

  const nextTaxRate = clamp(dashboard.population.taxRate, 0, 100);
  const nextLoyalty = clamp(dashboard.population.loyalty - 1, 0, 100);
  const nextUnrest = clamp(dashboard.population.unrest - 2, 0, 100);

  const { error: popError } = await supabase
    .from("city_population_state")
    .update({ tax_rate: nextTaxRate, loyalty: nextLoyalty, unrest: nextUnrest })
    .eq("city_id", dashboard.city.id);

  if (popError) {
    redirect(`/game?error=${encodeURIComponent(popError.message)}`);
  }

  const { error: mandateError } = await supabase.from("city_mandates").insert({
    city_id: dashboard.city.id,
    mandate_key: "civic_service",
    loyalty_delta: -1,
    unrest_delta: -2,
    tax_rate_delta: 0,
  });

  if (mandateError) {
    redirect(`/game?error=${encodeURIComponent(mandateError.message)}`);
  }

  revalidatePath("/game");
  redirect("/game?message=Civic%20service%20mandate%20issued.");
}
