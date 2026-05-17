export type ResourceSnapshot = {
  food: number;
  gold: number;
  iron: number;
  lumber: number;
  stone: number;
};

export function calculateElapsedHours(from: Date, to: Date) {
  const milliseconds = Math.max(0, to.getTime() - from.getTime());
  return milliseconds / 3_600_000;
}

export function accrueResources(
  snapshot: ResourceSnapshot,
  productionPerHour: ResourceSnapshot,
  elapsedHours: number,
): ResourceSnapshot {
  const clampedHours = Math.max(0, elapsedHours);

  return {
    gold: Math.floor(snapshot.gold + productionPerHour.gold * clampedHours),
    food: Math.floor(snapshot.food + productionPerHour.food * clampedHours),
    lumber: Math.floor(snapshot.lumber + productionPerHour.lumber * clampedHours),
    stone: Math.floor(snapshot.stone + productionPerHour.stone * clampedHours),
    iron: Math.floor(snapshot.iron + productionPerHour.iron * clampedHours),
  };
}

export function formatResourceAmount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
