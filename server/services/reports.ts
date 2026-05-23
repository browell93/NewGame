export type PlayerReport = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

type ReportRow = {
  id: string;
  report_type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

type ReportsClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: ReportRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getPlayerReports(client: ReportsClient, playerId: string): Promise<PlayerReport[]> {
  const { data, error } = await client
    .from("player_reports")
    .select("id, report_type, title, body, is_read, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load reports: ${error.message}`);
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    type: r.report_type,
    title: r.title,
    body: r.body,
    isRead: r.is_read,
    createdAt: r.created_at,
  }));
}
