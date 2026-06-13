export type WarOrder = {
  id: string;
  orderKey: string;
  targetRegionKey: string;
  troopType: string;
  troopQuantity: number;
  status: string;
  createdAt: string;
};

type WarOrderRow = {
  id: string;
  order_key: string;
  target_region_key: string;
  troop_type: string;
  troop_quantity: number;
  status: string;
  created_at: string;
};

type WarOrdersClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => {
          limit: (count: number) => Promise<{ data: WarOrderRow[] | null; error: { message: string } | null }>;
        };
      };
    };
  };
};

export async function getPlayerWarOrders(client: WarOrdersClient, playerId: string): Promise<WarOrder[]> {
  const { data, error } = await client
    .from("city_war_orders")
    .select("id, order_key, target_region_key, troop_type, troop_quantity, status, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Could not load war orders: ${error.message}`);
  }

  return (data ?? []).map((order) => ({
    id: order.id,
    orderKey: order.order_key,
    targetRegionKey: order.target_region_key,
    troopType: order.troop_type,
    troopQuantity: order.troop_quantity,
    status: order.status,
    createdAt: order.created_at,
  }));
}
