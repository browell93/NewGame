"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

export async function assignFirstHeroAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game/heroes?error=City%20not%20found");
  }

  const { data: firstHero, error: heroError } = await supabase
    .from("city_heroes")
    .select("id")
    .eq("city_id", dashboard.city.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (heroError || !firstHero) {
    redirect(`/game/heroes?error=${encodeURIComponent(heroError?.message ?? "Recruit a hero first")}`);
  }

  const { error } = await supabase.from("city_hero_assignments").upsert(
    {
      city_id: dashboard.city.id,
      hero_id: firstHero.id,
      assignment_type: "resource_boost",
      assigned_at: new Date().toISOString(),
    },
    { onConflict: "hero_id" },
  );

  if (error) {
    redirect(`/game/heroes?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game/heroes");
  redirect("/game/heroes?message=First%20hero%20assigned");
}
