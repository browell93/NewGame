import type { SupabaseClient } from "@supabase/supabase-js";

export type CityOrdinance = {
  id: string;
  ordinanceKey: string;
  loyaltyDelta: number;
  unrestDelta: number;
  taxRateDelta: number;
  createdAt: string;
};

export async function getCityOrdinances(client: SupabaseClient, cityId: string): Promise<CityOrdinance[]> {
  const { data, error } = await client
    .from("city_ordinances")
    .select("id, ordinance_key, loyalty_delta, unrest_delta, tax_rate_delta, created_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Unable to load city ordinances: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    ordinanceKey: row.ordinance_key,
    loyaltyDelta: row.loyalty_delta,
    unrestDelta: row.unrest_delta,
    taxRateDelta: row.tax_rate_delta,
    createdAt: row.created_at,
  }));
}
