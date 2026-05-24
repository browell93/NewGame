export type BuildQueueItem = {
  id: string;
  buildingKey: string;
  targetLevel: number;
  status: string;
  endsAt: string;
};

type QueueRow = {
  id: string;
  building_key: string;
  target_level: number;
  status: string;
  ends_at: string;
};

type QueryError = { message: string } | null;

type QueueClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: QueueRow[] | null; error: QueryError }>;
      };
    };
  };
};

export async function getCityBuildQueues(client: QueueClient, cityId: string): Promise<BuildQueueItem[]> {
  const { data, error }: { data: QueueRow[] | null; error: QueryError } = await client
    .from("city_build_queues")
    .select("id, building_key, target_level, status, ends_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load build queues: ${error.message}`);
  }

  return (data ?? []).map((q) => ({
    id: q.id,
    buildingKey: q.building_key,
    targetLevel: q.target_level,
    status: q.status,
    endsAt: q.ends_at,
  }));
}
