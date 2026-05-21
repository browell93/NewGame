import { describe, expect, it } from "vitest";
import { getBeginnerProtectionLabel, isBeginnerProtectionActive } from "@/lib/game/beginner-protection";

describe("beginner protection", () => {
  const now = new Date("2026-05-19T00:00:00.000Z");

  it("is active when end time is in the future and no break reason", () => {
    expect(
      isBeginnerProtectionActive({
        endsAtIso: "2026-05-20T00:00:00.000Z",
        breakReason: null,
      }, now),
    ).toBe(true);
  });

  it("expires when end time has passed", () => {
    expect(
      isBeginnerProtectionActive({
        endsAtIso: "2026-05-18T23:59:59.000Z",
        breakReason: null,
      }, now),
    ).toBe(false);
    expect(
      getBeginnerProtectionLabel({
        endsAtIso: "2026-05-18T23:59:59.000Z",
        breakReason: null,
      }, now),
    ).toBe("Expired");
  });

  it("ends early if a break reason exists", () => {
    expect(
      isBeginnerProtectionActive({
        endsAtIso: "2026-05-20T00:00:00.000Z",
        breakReason: "attacked another player",
      }, now),
    ).toBe(false);

    expect(
      getBeginnerProtectionLabel({
        endsAtIso: "2026-05-20T00:00:00.000Z",
        breakReason: "attacked another player",
      }, now),
    ).toBe("Ended early: attacked another player");
  });
});
