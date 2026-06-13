export type CityMarch = {
  id: string;
  destinationRegionKey: string;
  troopType: string;
  troopQuantity: number;
  status: string;
  departsAt: string;
  arrivesAt: string;
  warOrderId: string | null;
};

type MarchRow = {
  id: string;
  destination_region_key: string;
  troop_type: string;
  troop_quantity: number;
  status: string;
  departs_at: string;
  arrives_at: string;
  war_order_id: string | null;
};

type MarchesClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: MarchRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getPlayerMarches(client: MarchesClient, playerId: string): Promise<CityMarch[]> {
  const { data, error } = await client
    .from("city_marches")
    .select("id, destination_region_key, troop_type, troop_quantity, status, departs_at, arrives_at, war_order_id")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load marches: ${error.message}`);
  }

  return (data ?? []).map((m) => ({
    id: m.id,
    destinationRegionKey: m.destination_region_key,
    troopType: m.troop_type,
    troopQuantity: m.troop_quantity,
    status: m.status,
    departsAt: m.departs_at,
    arrivesAt: m.arrives_at,
    warOrderId: m.war_order_id,
  }));
}
