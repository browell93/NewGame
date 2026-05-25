"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { computeHourlyFoodUpkeepFromMilitiaCount } from "@/server/services/troop-upkeep";

export async function recalculateTroopUpkeepAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game/troops?error=City%20not%20found");
  }

  const { data: militiaStack, error: militiaError } = await supabase
    .from("city_troop_stacks")
    .select("quantity")
    .eq("city_id", dashboard.city.id)
    .eq("troop_type", "militia")
    .maybeSingle();

  if (militiaError) {
    redirect(`/game/troops?error=${encodeURIComponent(militiaError.message)}`);
  }

  const hourlyFoodUpkeep = computeHourlyFoodUpkeepFromMilitiaCount(militiaStack?.quantity ?? 0);

  const { error } = await supabase.from("city_troop_upkeep_state").upsert(
    {
      city_id: dashboard.city.id,
      hourly_food_upkeep: hourlyFoodUpkeep,
      last_calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "city_id" },
  );

  if (error) {
    redirect(`/game/troops?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game/troops");
  redirect("/game/troops?message=Troop%20upkeep%20recalculated");
}
