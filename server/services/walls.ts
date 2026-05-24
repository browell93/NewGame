export type CityWallState = {
  wallLevel: number;
  durabilityCurrent: number;
  durabilityMax: number;
  trapCount: number;
};

type WallRow = {
  wall_level: number;
  durability_current: number;
  durability_max: number;
  trap_count: number;
};

type WallsClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: WallRow | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityWallState(client: WallsClient, cityId: string): Promise<CityWallState | null> {
  const { data, error } = await client
    .from("city_wall_state")
    .select("wall_level, durability_current, durability_max, trap_count")
    .eq("city_id", cityId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load wall state: ${error.message}`);
  }

  if (!data) return null;

  return {
    wallLevel: data.wall_level,
    durabilityCurrent: data.durability_current,
    durabilityMax: data.durability_max,
    trapCount: data.trap_count,
  };
}
