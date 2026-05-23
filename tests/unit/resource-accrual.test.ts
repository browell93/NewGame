import { describe, expect, it } from "vitest";
import {
  getProductionPerHour,
  projectAccruedResources,
  projectCollectableResources,
} from "@/server/services/resource-accrual";

describe("resource accrual service", () => {
  it("increases gold production with tax", () => {
    const prod10 = getProductionPerHour(10);
    const prod30 = getProductionPerHour(30);

    expect(prod30.gold).toBeGreaterThan(prod10.gold);
    expect(prod30.food).toBe(prod10.food);
  });

  it("projects resources based on elapsed time", () => {
    const projected = projectAccruedResources(
      {
        snapshot: { gold: 1000, food: 5000, lumber: 3000, stone: 2500, iron: 1500 },
        lastCollectedAt: "2026-05-20T00:00:00.000Z",
        taxRate: 10,
      },
      new Date("2026-05-20T02:00:00.000Z"),
    );

    expect(projected.gold).toBeGreaterThan(1000);
    expect(projected.food).toBeGreaterThan(5000);
  });

  it("preserves fractional accrual between frequent collections", () => {
    const startedAt = new Date("2026-05-20T00:00:00.000Z");
    const firstCollectionAt = new Date("2026-05-20T00:00:20.000Z");
    const secondCollectionAt = new Date("2026-05-20T00:01:40.000Z");

    const firstProjection = projectCollectableResources(
      {
        snapshot: { gold: 1000, food: 5000, lumber: 3000, stone: 2500, iron: 1500 },
        lastCollectedAt: startedAt.toISOString(),
        taxRate: 10,
      },
      firstCollectionAt,
    );

    expect(firstProjection.resources.gold).toBe(1000);

    const secondProjection = projectCollectableResources(
      {
        snapshot: firstProjection.resources,
        fractions: firstProjection.fractions,
        lastCollectedAt: firstProjection.nextLastCollectedAt,
        taxRate: 10,
      },
      secondCollectionAt,
    );

    expect(secondProjection.resources.gold).toBeGreaterThan(firstProjection.resources.gold);
    expect(firstProjection.fractions.gold).toBeGreaterThan(0);
  });
});
