import { describe, it, expect } from "vitest";
import { formatDate, hashIndex } from "./format";

describe("formatDate", () => {
  it("formats an ISO date as Month D, YYYY", () => {
    expect(formatDate("2026-06-18T12:00:00.000Z")).toBe("June 18, 2026");
  });
  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
  });
});

describe("hashIndex", () => {
  it("is deterministic and within range", () => {
    const a = hashIndex("hello", 6);
    expect(a).toBe(hashIndex("hello", 6));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(6);
  });
});
