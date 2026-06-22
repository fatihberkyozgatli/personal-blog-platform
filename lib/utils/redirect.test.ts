import { describe, it, expect } from "vitest";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it("returns / for null or empty", () => {
    expect(safeNext(null)).toBe("/");
    expect(safeNext("")).toBe("/");
  });
  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("/\\evil.com")).toBe("/");
    expect(safeNext("/@evil.com")).toBe("/");
  });
  it("allows local paths", () => {
    expect(safeNext("/admin")).toBe("/admin");
    expect(safeNext("/blogs/post?ref=1")).toBe("/blogs/post?ref=1");
  });
});
