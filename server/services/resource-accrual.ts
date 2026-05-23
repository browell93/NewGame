import { accrueResources, calculateElapsedHours, type ResourceSnapshot } from "@/lib/game/resource-math";

export type ResourceAccrualInput = {
  snapshot: ResourceSnapshot;
  fractions?: ResourceSnapshot;
  lastCollectedAt: string;
  taxRate: number;
};

export type ResourceAccrualProjection = {
  resources: ResourceSnapshot;
  fractions: ResourceSnapshot;
  nextLastCollectedAt: string;
};

const BASE_PRODUCTION_PER_HOUR: ResourceSnapshot = {
  gold: 36,
  food: 140,
  lumber: 110,
  stone: 95,
  iron: 80,
};

export function getProductionPerHour(taxRate: number): ResourceSnapshot {
  const taxMultiplier = 1 + Math.max(0, taxRate) / 100;

  return {
    gold: Math.floor(BASE_PRODUCTION_PER_HOUR.gold * taxMultiplier),
    food: BASE_PRODUCTION_PER_HOUR.food,
    lumber: BASE_PRODUCTION_PER_HOUR.lumber,
    stone: BASE_PRODUCTION_PER_HOUR.stone,
    iron: BASE_PRODUCTION_PER_HOUR.iron,
  };
}

export function projectAccruedResources(input: ResourceAccrualInput, now = new Date()): ResourceSnapshot {
  const lastCollectedAt = new Date(input.lastCollectedAt);
  const elapsedHours = calculateElapsedHours(lastCollectedAt, now);
  return accrueResources(input.snapshot, getProductionPerHour(input.taxRate), elapsedHours);
}

export function projectCollectableResources(input: ResourceAccrualInput, now = new Date()): ResourceAccrualProjection {
  const production = getProductionPerHour(input.taxRate);
  const lastCollectedAt = new Date(input.lastCollectedAt);
  const elapsedHours = calculateElapsedHours(lastCollectedAt, now);
  const previousFractions = input.fractions ?? { gold: 0, food: 0, lumber: 0, stone: 0, iron: 0 };

  const resourceKeys: Array<keyof ResourceSnapshot> = ["gold", "food", "lumber", "stone", "iron"];
  const resources = { ...input.snapshot };
  const fractions = { ...previousFractions };

  for (const key of resourceKeys) {
    const raw = input.snapshot[key] + previousFractions[key] + production[key] * elapsedHours;
    resources[key] = Math.floor(raw);
    fractions[key] = raw - resources[key];
  }

  return {
    resources,
    fractions,
    nextLastCollectedAt: now.toISOString(),
  };
}
