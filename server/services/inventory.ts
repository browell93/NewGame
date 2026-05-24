export type InventoryItem = {
  id: string;
  itemKey: string;
  itemName: string;
  quantity: number;
  rarity: string;
};

type InventoryRow = {
  id: string;
  item_key: string;
  item_name: string;
  quantity: number;
  rarity: string;
};

type InventoryClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: InventoryRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityInventory(client: InventoryClient, cityId: string): Promise<InventoryItem[]> {
  const { data, error } = await client
    .from("city_inventory_items")
    .select("id, item_key, item_name, quantity, rarity")
    .eq("city_id", cityId)
    .order("item_name", { ascending: true });

  if (error) {
    throw new Error(`Could not load inventory: ${error.message}`);
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    itemKey: item.item_key,
    itemName: item.item_name,
    quantity: item.quantity,
    rarity: item.rarity,
  }));
}
