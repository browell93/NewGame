export type LoyaltyEvent = {
  id: string;
  eventType: string;
  loyaltyDelta: number;
  unrestDelta: number;
  createdAt: string;
};

type LoyaltyEventRow = {
  id: string;
  event_type: string;
  loyalty_delta: number;
  unrest_delta: number;
  created_at: string;
};

type LoyaltyEventsClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: LoyaltyEventRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityLoyaltyEvents(client: LoyaltyEventsClient, cityId: string): Promise<LoyaltyEvent[]> {
  const { data, error } = await client
    .from("city_loyalty_events")
    .select("id, event_type, loyalty_delta, unrest_delta, created_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load loyalty events: ${error.message}`);
  }

  return (data ?? []).map((event) => ({
    id: event.id,
    eventType: event.event_type,
    loyaltyDelta: event.loyalty_delta,
    unrestDelta: event.unrest_delta,
    createdAt: event.created_at,
  }));
}
