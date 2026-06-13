"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveInt(formData: FormData, field: string, fallback: number) {
  const value = Number.parseInt(readText(formData, field), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export async function planBorderPatrolOrderAction(formData: FormData) {
  const targetRegionKey = readText(formData, "targetRegionKey") || "frontier-02";
  const troopQuantity = readPositiveInt(formData, "troopQuantity", 15);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in.");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game/map?error=City%20not%20found.");
  }

  const { error } = await supabase.from("city_war_orders").insert({
    player_id: user.id,
    city_id: dashboard.city.id,
    order_key: "border_patrol",
    target_region_key: targetRegionKey,
    troop_type: "militia",
    troop_quantity: troopQuantity,
    status: "planned",
  });

  if (error) {
    redirect(`/game/map?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game/map");
  redirect("/game/map?message=Border%20patrol%20order%20planned.");
}
