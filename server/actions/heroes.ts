"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

const STARTING_HERO_NAMES = ["Aldric", "Elyra", "Kael", "Seren", "Brann"];

export async function recruitHeroAction() {
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

  const { data: existingHeroes, error: existingError } = await supabase
    .from("city_heroes")
    .select("name")
    .eq("city_id", dashboard.city.id);

  if (existingError) {
    redirect(`/game/heroes?error=${encodeURIComponent(existingError.message)}`);
  }

  const usedNames = new Set((existingHeroes ?? []).map((h: { name: string }) => h.name));
  const candidateName = STARTING_HERO_NAMES.find((n) => !usedNames.has(n)) ?? `Hero ${usedNames.size + 1}`;

  const { error } = await supabase.from("city_heroes").insert({
    city_id: dashboard.city.id,
    name: candidateName,
    role: "governor",
    level: 1,
    assigned_building_key: "town_hall",
  });

  if (error) {
    redirect(`/game/heroes?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game/heroes");
  redirect("/game/heroes?message=Hero%20recruited");
}
