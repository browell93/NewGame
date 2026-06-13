import type { SupabaseClient } from "@supabase/supabase-js";

export type CityMandate = {
  id: string;
  mandateKey: string;
  loyaltyDelta: number;
  unrestDelta: number;
  taxRateDelta: number;
  createdAt: string;
};

export async function getCityMandates(client: SupabaseClient, cityId: string): Promise<CityMandate[]> {
  const { data, error } = await client
    .from("city_mandates")
    .select("id, mandate_key, loyalty_delta, unrest_delta, tax_rate_delta, created_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Unable to load city mandates: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    mandateKey: row.mandate_key,
    loyaltyDelta: row.loyalty_delta,
    unrestDelta: row.unrest_delta,
    taxRateDelta: row.tax_rate_delta,
    createdAt: row.created_at,
  }));
}
