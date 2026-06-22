import { afterEach, describe, expect, it, vi } from "vitest";
import { isLikelyBot } from "./spam-guard";

function fd(entries: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}

describe("isLikelyBot", () => {
  afterEach(() => vi.restoreAllMocks());

  it("flags filled honeypot fields", () => {
    expect(isLikelyBot(fd({ company: "bot" }))).toBe(true);
  });

  it("flags unrealistically fast submissions", () => {
    vi.spyOn(Date, "now").mockReturnValue(2000);
    expect(isLikelyBot(fd({ startedAt: "1500" }))).toBe(true);
  });

  it("allows normal submissions and missing timestamps", () => {
    vi.spyOn(Date, "now").mockReturnValue(5000);
    expect(isLikelyBot(fd({ startedAt: "1000" }))).toBe(false);
    expect(isLikelyBot(fd({}))).toBe(false);
  });
});
