import { describe, expect, it } from "vitest";
import { accrueResources, calculateElapsedHours } from "@/lib/game/resource-math";

describe("resource math", () => {
  it("calculates elapsed hours without going negative", () => {
    const from = new Date("2026-05-17T12:00:00.000Z");
    const to = new Date("2026-05-17T15:30:00.000Z");

    expect(calculateElapsedHours(from, to)).toBe(3.5);
    expect(calculateElapsedHours(to, from)).toBe(0);
  });

  it("accrues resources from hourly production", () => {
    const next = accrueResources(
      { gold: 1000, food: 5000, lumber: 3000, stone: 2500, iron: 1500 },
      { gold: 30, food: 120, lumber: 100, stone: 90, iron: 75 },
      2.5,
    );

    expect(next).toEqual({
      gold: 1075,
      food: 5300,
      lumber: 3250,
      stone: 2725,
      iron: 1687,
    });
  });
});
