"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

export async function queueFirstFieldUpgradeAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game/resources?error=City%20not%20found");

  const { data: firstField, error: fieldError } = await supabase
    .from("resource_fields")
    .select("id, level")
    .eq("city_id", dashboard.city.id)
    .order("plot_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fieldError || !firstField) redirect(`/game/resources?error=${encodeURIComponent(fieldError?.message ?? "No resource fields found")}`);

  const { error } = await supabase.from("resource_field_upgrade_queues").insert({
    city_id: dashboard.city.id,
    field_id: firstField.id,
    target_level: (firstField.level ?? 1) + 1,
    status: "queued",
    ends_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  if (error) redirect(`/game/resources?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/resources");
  redirect("/game/resources?message=Field%20upgrade%20queued");
}
