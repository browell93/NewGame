export type HeroAssignment = {
  heroId: string;
  assignmentType: string;
  assignedAt: string;
};

type HeroAssignmentRow = {
  hero_id: string;
  assignment_type: string;
  assigned_at: string;
};

type HeroAssignmentsClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: HeroAssignmentRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityHeroAssignments(client: HeroAssignmentsClient, cityId: string): Promise<HeroAssignment[]> {
  const { data, error } = await client
    .from("city_hero_assignments")
    .select("hero_id, assignment_type, assigned_at")
    .eq("city_id", cityId)
    .order("assigned_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load hero assignments: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    heroId: row.hero_id,
    assignmentType: row.assignment_type,
    assignedAt: row.assigned_at,
  }));
}
