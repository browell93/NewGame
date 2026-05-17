import { describe, expect, it, vi } from "vitest";
import { deriveDisplayName, ensureStarterCityForUser } from "@/server/services/bootstrap";

const fakeUser = {
  id: "8a1ebf5b-9d1d-4d10-8532-c0afbbd1b8cf",
  email: "ashwarden@example.com",
  user_metadata: {
    display_name: "Ashwarden",
  },
};

describe("starter city bootstrap", () => {
  it("prefers the metadata display name", () => {
    expect(deriveDisplayName(fakeUser as never)).toBe("Ashwarden");
  });

  it("falls back to the email local-part", () => {
    expect(
      deriveDisplayName({
        email: "ruler.one@example.com",
        user_metadata: {},
      } as never),
    ).toBe("ruler.one");
  });

  it("calls the transactional bootstrap RPC with the authenticated user", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ city_id: "city-1", created: true }],
      error: null,
    });

    const result = await ensureStarterCityForUser({ rpc } as never, fakeUser as never);

    expect(rpc).toHaveBeenCalledWith("create_starter_city_for_user", {
      p_user_id: fakeUser.id,
      p_display_name: "Ashwarden",
    });
    expect(result).toEqual({ city_id: "city-1", created: true });
  });
});
