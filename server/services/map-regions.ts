export type MapRegion = {
  key: string;
  name: string;
  threatLevel: number;
  x: number;
  y: number;
  discovered: boolean;
};

type RegionRow = { key: string; name: string; threat_level: number; x: number; y: number };
type DiscoveryRow = { region_key: string };

type MapClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => Promise<{ data: DiscoveryRow[] | null; error: { message: string } | null }>;
      order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: RegionRow[] | null; error: { message: string } | null }>;
    };
  };
};

export async function getPlayerMapRegions(client: MapClient, playerId: string): Promise<MapRegion[]> {
  const regionsResult = await client.from("map_regions").select("key, name, threat_level, x, y").order("threat_level", { ascending: true });
  if (regionsResult.error) throw new Error(`Could not load map regions: ${regionsResult.error.message}`);

  const discoveryResult = await client.from("player_region_discovery").select("region_key").eq("player_id", playerId);
  if (discoveryResult.error) throw new Error(`Could not load discovered regions: ${discoveryResult.error.message}`);

  const discovered = new Set((discoveryResult.data ?? []).map((d) => d.region_key));

  return (regionsResult.data ?? []).map((r) => ({
    key: r.key,
    name: r.name,
    threatLevel: r.threat_level,
    x: r.x,
    y: r.y,
    discovered: discovered.has(r.key),
  }));
}
