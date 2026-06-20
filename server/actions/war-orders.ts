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


type PlannedWarOrderRow = {
  id: string;
  city_id: string;
  target_region_key: string;
  troop_type: string;
  troop_quantity: number;
};

export async function mobilizeLatestWarOrderAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in.");
  }

  const { data: orders, error: orderError } = await supabase
    .from("city_war_orders")
    .select("id, city_id, target_region_key, troop_type, troop_quantity")
    .eq("player_id", user.id)
    .eq("status", "planned")
    .order("created_at", { ascending: false })
    .limit(1);

  if (orderError) {
    redirect(`/game/map?error=${encodeURIComponent(orderError.message)}`);
  }

  const order = (orders?.[0] as PlannedWarOrderRow | undefined) ?? null;
  if (!order) {
    redirect("/game/map?error=No%20planned%20war%20order%20to%20mobilize.");
  }

  const arrivesAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const { error: marchError } = await supabase.from("city_marches").insert({
    player_id: user.id,
    origin_city_id: order.city_id,
    destination_region_key: order.target_region_key,
    troop_type: order.troop_type,
    troop_quantity: order.troop_quantity,
    status: "outbound",
    arrives_at: arrivesAt,
    war_order_id: order.id,
  });

  if (marchError) {
    redirect(`/game/map?error=${encodeURIComponent(marchError.message)}`);
  }

  const { error: updateError } = await supabase
    .from("city_war_orders")
    .update({ status: "mobilizing" })
    .eq("id", order.id)
    .eq("player_id", user.id);

  if (updateError) {
    redirect(`/game/map?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/game/map");
  redirect("/game/map?message=Latest%20war%20order%20mobilized.");
}
