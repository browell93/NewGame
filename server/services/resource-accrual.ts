import { accrueResources, calculateElapsedHours, type ResourceSnapshot } from "@/lib/game/resource-math";

export type ResourceAccrualInput = {
  snapshot: ResourceSnapshot;
  lastCollectedAt: string;
  taxRate: number;
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
  const elapsedHours = calculateElapsedHours(new Date(input.lastCollectedAt), now);
  return accrueResources(input.snapshot, getProductionPerHour(input.taxRate), elapsedHours);
}
