import { describe, expect, it } from "vitest";
import { getProductionPerHour, projectAccruedResources } from "@/server/services/resource-accrual";

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
});
