"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export async function hostFestivalAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game?error=City%20not%20found");
  }

  const nextLoyalty = clamp(dashboard.population.loyalty + 3, 0, 100);
  const nextUnrest = clamp(dashboard.population.unrest - 2, 0, 100);

  const { error: populationError } = await supabase
    .from("city_population_state")
    .update({
      loyalty: nextLoyalty,
      unrest: nextUnrest,
      updated_at: new Date().toISOString(),
    })
    .eq("city_id", dashboard.city.id);

  if (populationError) {
    redirect(`/game?error=${encodeURIComponent(populationError.message)}`);
  }

  const { error: eventError } = await supabase.from("city_loyalty_events").insert({
    city_id: dashboard.city.id,
    event_type: "festival",
    loyalty_delta: 3,
    unrest_delta: -2,
  });

  if (eventError) {
    redirect(`/game?error=${encodeURIComponent(eventError.message)}`);
  }

  revalidatePath("/game");
  redirect("/game?message=Festival%20hosted");
}
