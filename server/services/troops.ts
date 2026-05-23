export type TroopStack = { troopType: string; quantity: number };
export type TroopTrainingQueue = { id: string; troopType: string; quantity: number; status: string; endsAt: string };

type TroopStackRow = { troop_type: string; quantity: number };
type TroopQueueRow = { id: string; troop_type: string; quantity: number; status: string; ends_at: string };

type TroopsClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityTroops(client: TroopsClient, cityId: string): Promise<{ stacks: TroopStack[]; queues: TroopTrainingQueue[] }> {
  const stacksResult = await client.from("city_troop_stacks").select("troop_type, quantity").eq("city_id", cityId).order("troop_type", { ascending: true });
  if (stacksResult.error) throw new Error(`Could not load troop stacks: ${stacksResult.error.message}`);

  const queuesResult = await client.from("city_troop_training_queues").select("id, troop_type, quantity, status, ends_at").eq("city_id", cityId).order("created_at", { ascending: true });
  if (queuesResult.error) throw new Error(`Could not load troop queues: ${queuesResult.error.message}`);

  const stacks = (stacksResult.data as TroopStackRow[] | null ?? []).map((s) => ({ troopType: s.troop_type, quantity: s.quantity }));
  const queues = (queuesResult.data as TroopQueueRow[] | null ?? []).map((q) => ({ id: q.id, troopType: q.troop_type, quantity: q.quantity, status: q.status, endsAt: q.ends_at }));

  return { stacks, queues };
}
