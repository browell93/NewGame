export type TroopUpkeepState = {
  hourlyFoodUpkeep: number;
  lastCalculatedAt: string;
};

type UpkeepClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { hourly_food_upkeep: number; last_calculated_at: string } | null; error: { message: string } | null }>;
      };
    };
  };
};

export function computeHourlyFoodUpkeepFromMilitiaCount(militiaCount: number): number {
  return Math.max(0, militiaCount) * 2;
}

export async function getCityTroopUpkeep(client: UpkeepClient, cityId: string): Promise<TroopUpkeepState | null> {
  const { data, error } = await client
    .from("city_troop_upkeep_state")
    .select("hourly_food_upkeep, last_calculated_at")
    .eq("city_id", cityId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load troop upkeep: ${error.message}`);
  }

  if (!data) return null;

  return {
    hourlyFoodUpkeep: data.hourly_food_upkeep,
    lastCalculatedAt: data.last_calculated_at,
  };
}
