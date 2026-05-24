export type CityHero = {
  id: string;
  name: string;
  role: string;
  level: number;
  assignedBuildingKey: string | null;
};

type HeroRow = {
  id: string;
  name: string;
  role: string;
  level: number;
  assigned_building_key: string | null;
};

type HeroesClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: HeroRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityHeroes(client: HeroesClient, cityId: string): Promise<CityHero[]> {
  const { data, error } = await client
    .from("city_heroes")
    .select("id, name, role, level, assigned_building_key")
    .eq("city_id", cityId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load heroes: ${error.message}`);
  }

  return (data ?? []).map((hero) => ({
    id: hero.id,
    name: hero.name,
    role: hero.role,
    level: hero.level,
    assignedBuildingKey: hero.assigned_building_key,
  }));
}
