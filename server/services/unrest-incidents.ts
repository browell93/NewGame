import type { SupabaseClient } from "@supabase/supabase-js";

export type UnrestIncident = {
  id: string;
  incidentKey: string;
  loyaltyDelta: number;
  unrestDelta: number;
  taxRateDelta: number;
  createdAt: string;
};

export async function getCityUnrestIncidents(client: SupabaseClient, cityId: string): Promise<UnrestIncident[]> {
  const { data, error } = await client
    .from("city_unrest_incidents")
    .select("id, incident_key, loyalty_delta, unrest_delta, tax_rate_delta, created_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Unable to load unrest incidents: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    incidentKey: row.incident_key,
    loyaltyDelta: row.loyalty_delta,
    unrestDelta: row.unrest_delta,
    taxRateDelta: row.tax_rate_delta,
    createdAt: row.created_at,
  }));
}
