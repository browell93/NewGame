"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function logAllianceDrillAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("alliance_members")
    .select("alliance_id")
    .eq("player_id", user.id)
    .maybeSingle();

  if (membershipError || !membership?.alliance_id) {
    redirect(`/game/alliance?error=${encodeURIComponent(membershipError?.message ?? "Join an alliance first")}`);
  }

  const { error } = await supabase.from("alliance_events").insert({
    alliance_id: membership.alliance_id,
    event_type: "military_drill",
    actor_player_id: user.id,
    payload: {
      note: "Alliance drill scheduled",
      scheduledAt: new Date().toISOString(),
    },
  });

  if (error) {
    redirect(`/game/alliance?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/game/alliance");
  redirect("/game/alliance?message=Alliance%20drill%20event%20logged");
}
