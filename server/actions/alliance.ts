"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function createAllianceAction(formData: FormData) {
  const name = readText(formData, "name");
  const tag = readText(formData, "tag").toUpperCase();

  if (!name || !tag) redirect("/game/alliance?error=Name%20and%20tag%20are%20required");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const { data: existingMembership } = await supabase.from("alliance_members").select("id").eq("player_id", user.id).maybeSingle();
  if (existingMembership) redirect("/game/alliance?error=You%20are%20already%20in%20an%20alliance");

  const { data: alliance, error: createError } = await supabase
    .from("alliances")
    .insert({ name, tag, leader_player_id: user.id })
    .select("id")
    .single();

  if (createError || !alliance) redirect(`/game/alliance?error=${encodeURIComponent(createError?.message ?? "Could not create alliance")}`);

  const { error: memberError } = await supabase.from("alliance_members").insert({
    alliance_id: alliance.id,
    player_id: user.id,
    role: "leader",
  });

  if (memberError) redirect(`/game/alliance?error=${encodeURIComponent(memberError.message)}`);

  revalidatePath("/game/alliance");
  redirect("/game/alliance?message=Alliance%20created");
}

export async function postAllianceMessageAction(formData: FormData) {
  const body = readText(formData, "body");
  if (!body) redirect("/game/alliance?error=Message%20cannot%20be%20empty");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in");

  const { data: membership } = await supabase
    .from("alliance_members")
    .select("alliance_id")
    .eq("player_id", user.id)
    .maybeSingle();

  if (!membership?.alliance_id) redirect("/game/alliance?error=Join%20or%20create%20an%20alliance%20first");

  const { error } = await supabase.from("alliance_messages").insert({
    alliance_id: membership.alliance_id,
    sender_player_id: user.id,
    body,
  });

  if (error) redirect(`/game/alliance?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/game/alliance");
  redirect("/game/alliance?message=Message%20posted");
}
