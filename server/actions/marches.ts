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

export async function dispatchScoutMarchAction(formData: FormData) {
  const destinationRegionKey = readText(formData, "destinationRegionKey") || "frontier-02";
  const troopQuantity = readPositiveInt(formData, "troopQuantity", 10);

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game/map?error=City%20not%20found");

  const arrivesAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

  const { error } = await supabase.from("city_marches").insert({
    player_id: user.id,
    origin_city_id: dashboard.city.id,
    destination_region_key: destinationRegionKey,
    troop_type: "militia",
    troop_quantity: troopQuantity,
    status: "outbound",
    arrives_at: arrivesAt,
  });

  if (error) redirect(`/game/map?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/map");
  redirect("/game/map?message=Scout%20march%20dispatched");
}
