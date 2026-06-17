import { describe, it, expect, beforeEach, vi } from "vitest";

describe("env", () => {
  beforeEach(() => vi.resetModules());

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing/invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    await expect(import("./env")).rejects.toThrow();
  });

  it("parses when both vars are present", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    const { env } = await import("./env");
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
  });
});
