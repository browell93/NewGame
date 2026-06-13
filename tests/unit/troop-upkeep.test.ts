import { describe, expect, it } from "vitest";
import { computeHourlyFoodUpkeepFromMilitiaCount } from "@/server/services/troop-upkeep";

describe("troop upkeep", () => {
  it("computes hourly food upkeep from militia count", () => {
    expect(computeHourlyFoodUpkeepFromMilitiaCount(0)).toBe(0);
    expect(computeHourlyFoodUpkeepFromMilitiaCount(10)).toBe(20);
    expect(computeHourlyFoodUpkeepFromMilitiaCount(25)).toBe(50);
  });

  it("clamps negative militia count to zero", () => {
    expect(computeHourlyFoodUpkeepFromMilitiaCount(-5)).toBe(0);
  });
});
