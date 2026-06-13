import type { SupabaseClient } from "@supabase/supabase-js";

export type CityProclamation = {
  id: string;
  proclamationKey: string;
  loyaltyDelta: number;
  unrestDelta: number;
  taxRateDelta: number;
  createdAt: string;
};

export async function getCityProclamations(client: SupabaseClient, cityId: string): Promise<CityProclamation[]> {
  const { data, error } = await client
    .from("city_proclamations")
    .select("id, proclamation_key, loyalty_delta, unrest_delta, tax_rate_delta, created_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Unable to load city proclamations: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    proclamationKey: row.proclamation_key,
    loyaltyDelta: row.loyalty_delta,
    unrestDelta: row.unrest_delta,
    taxRateDelta: row.tax_rate_delta,
    createdAt: row.created_at,
  }));
}
