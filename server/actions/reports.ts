"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function generateScoutReportAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const createdAt = new Date().toISOString();
  const { error } = await supabase.from("player_reports").insert({
    player_id: user.id,
    report_type: "scout",
    title: "Scouting Dispatch",
    body: `Your scouts returned with frontier intelligence at ${createdAt}.`,
    is_read: false,
  });

  if (error) redirect(`/game/reports?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/reports");
  redirect("/game/reports?message=Scout%20report%20generated");
}

export async function markAllReportsReadAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const { error } = await supabase
    .from("player_reports")
    .update({ is_read: true })
    .eq("player_id", user.id)
    .eq("is_read", false);

  if (error) redirect(`/game/reports?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/reports");
  redirect("/game/reports?message=All%20reports%20marked%20read");
}
