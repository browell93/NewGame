export type AllianceEvent = {
  id: string;
  eventType: string;
  actorPlayerId: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

type AllianceEventRow = {
  id: string;
  event_type: string;
  actor_player_id: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type AllianceEventsClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: AllianceEventRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getAllianceEvents(client: AllianceEventsClient, allianceId: string): Promise<AllianceEvent[]> {
  const { data, error } = await client
    .from("alliance_events")
    .select("id, event_type, actor_player_id, payload, created_at")
    .eq("alliance_id", allianceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load alliance events: ${error.message}`);
  }

  return (data ?? []).map((event) => ({
    id: event.id,
    eventType: event.event_type,
    actorPlayerId: event.actor_player_id,
    payload: event.payload,
    createdAt: event.created_at,
  }));
}
