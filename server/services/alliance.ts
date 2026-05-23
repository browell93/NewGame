export type AllianceSummary = {
  allianceId: string;
  name: string;
  tag: string;
  role: string;
};

export type AllianceMessage = {
  id: string;
  senderPlayerId: string;
  body: string;
  createdAt: string;
};

type AllianceClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { role?: string; alliance_id?: string; alliances?: { name?: string; tag?: string } | null } | null; error: { message: string } | null }>;
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: Array<{ id: string; sender_player_id: string; body: string; created_at: string }> | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getPlayerAlliance(client: AllianceClient, playerId: string): Promise<AllianceSummary | null> {
  const { data, error } = await client
    .from("alliance_members")
    .select("role, alliance_id, alliances(name, tag)")
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) throw new Error(`Could not load alliance membership: ${error.message}`);
  if (!data?.alliance_id || !data?.role) return null;

  return {
    allianceId: data.alliance_id,
    name: data.alliances?.name ?? "Unknown",
    tag: data.alliances?.tag ?? "----",
    role: data.role,
  };
}

export async function getAllianceMessages(client: AllianceClient, allianceId: string): Promise<AllianceMessage[]> {
  const { data, error } = await client
    .from("alliance_messages")
    .select("id, sender_player_id, body, created_at")
    .eq("alliance_id", allianceId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load alliance messages: ${error.message}`);

  return (data ?? []).map((m) => ({
    id: m.id,
    senderPlayerId: m.sender_player_id,
    body: m.body,
    createdAt: m.created_at,
  }));
}
