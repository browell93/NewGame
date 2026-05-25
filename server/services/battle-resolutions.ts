export type BattleResolution = {
  id: string;
  marchId: string;
  outcome: string;
  attackerLosses: number;
  defenderLosses: number;
  lootFood: number;
  resolvedAt: string;
};

type BattleRow = {
  id: string;
  march_id: string;
  outcome: string;
  attacker_losses: number;
  defender_losses: number;
  loot_food: number;
  resolved_at: string;
};

type BattleClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: BattleRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getPlayerBattleResolutions(client: BattleClient, playerId: string): Promise<BattleResolution[]> {
  const { data, error } = await client
    .from("march_battle_resolutions")
    .select("id, march_id, outcome, attacker_losses, defender_losses, loot_food, resolved_at")
    .eq("player_id", playerId)
    .order("resolved_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load battle resolutions: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    marchId: row.march_id,
    outcome: row.outcome,
    attackerLosses: row.attacker_losses,
    defenderLosses: row.defender_losses,
    lootFood: row.loot_food,
    resolvedAt: row.resolved_at,
  }));
}
