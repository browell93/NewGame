"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

const STARTER_CRATE = {
  item_key: "supply_crate",
  item_name: "Supply Crate",
  rarity: "common",
  quantity: 1,
};

export async function claimSupplyCrateAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game/inventory?error=City%20not%20found");

  const { data: existing, error: readError } = await supabase
    .from("city_inventory_items")
    .select("quantity")
    .eq("city_id", dashboard.city.id)
    .eq("item_key", STARTER_CRATE.item_key)
    .maybeSingle();

  if (readError) redirect(`/game/inventory?error=${encodeURIComponent(readError.message)}`);

  const nextQuantity = (existing?.quantity ?? 0) + STARTER_CRATE.quantity;

  const { error } = await supabase.from("city_inventory_items").upsert({
    city_id: dashboard.city.id,
    item_key: STARTER_CRATE.item_key,
    item_name: STARTER_CRATE.item_name,
    quantity: nextQuantity,
    rarity: STARTER_CRATE.rarity,
    updated_at: new Date().toISOString(),
  }, { onConflict: "city_id,item_key" });

  if (error) redirect(`/game/inventory?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/inventory");
  redirect("/game/inventory?message=Supply%20crate%20claimed");
}
