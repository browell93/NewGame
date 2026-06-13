import { afterEach, describe, expect, it } from "vitest";
import { getMissingSupabaseEnvNames, getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

afterEach(() => {
  if (originalSupabaseUrl) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  } else {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  if (originalSupabaseAnonKey) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
  } else {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
});

describe("Supabase environment config", () => {
  it("reports missing Supabase variables without throwing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(isSupabaseConfigured()).toBe(false);
    expect(getMissingSupabaseEnvNames()).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ]);
  });

  it("returns configured Supabase values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(isSupabaseConfigured()).toBe(true);
    expect(getSupabaseEnv()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
    });
  });

  it("throws setup instructions when required values are read before configuration", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(() => getSupabaseEnv()).toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. Set it in Vercel Project Settings > Environment Variables and redeploy.",
    );
  });
});
