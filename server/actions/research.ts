"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

export async function queueEconomyResearchAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game/research?error=City%20not%20found");
  }

  const { data: existing } = await supabase
    .from("city_research_queues")
    .select("target_level")
    .eq("city_id", dashboard.city.id)
    .eq("research_key", "economy")
    .order("target_level", { ascending: false })
    .limit(1)
    .maybeSingle();

  const targetLevel = (existing?.target_level ?? 0) + 1;
  const endsAt = new Date(Date.now() + 75 * 60 * 1000).toISOString();

  const { error } = await supabase.from("city_research_queues").insert({
    city_id: dashboard.city.id,
    research_key: "economy",
    target_level: targetLevel,
    status: "queued",
    ends_at: endsAt,
  });

  if (error) {
    redirect(`/game/research?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game/research");
  redirect("/game/research?message=Economy%20research%20queued");
}
