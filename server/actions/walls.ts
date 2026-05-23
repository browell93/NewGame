"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

export async function reinforceWallsAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game/walls?error=City%20not%20found");

  const { error } = await supabase.rpc("reinforce_city_walls", {
    target_city_id: dashboard.city.id,
  });

  if (error) redirect(`/game/walls?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/walls");
  redirect("/game/walls?message=Walls%20reinforced");
}
