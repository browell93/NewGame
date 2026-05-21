export type ResearchQueueItem = {
  id: string;
  researchKey: string;
  targetLevel: number;
  status: string;
  endsAt: string;
};

type QueueRow = {
  id: string;
  research_key: string;
  target_level: number;
  status: string;
  ends_at: string;
};

type ResearchQueueClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: QueueRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityResearchQueues(client: ResearchQueueClient, cityId: string): Promise<ResearchQueueItem[]> {
  const { data, error } = await client
    .from("city_research_queues")
    .select("id, research_key, target_level, status, ends_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load research queues: ${error.message}`);
  }

  return (data ?? []).map((q: QueueRow) => ({
    id: q.id,
    researchKey: q.research_key,
    targetLevel: q.target_level,
    status: q.status,
    endsAt: q.ends_at,
  }));
}
