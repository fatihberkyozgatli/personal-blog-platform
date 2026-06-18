import { describe, it, expect } from "vitest";
import { categorySchema } from "./category";

describe("categorySchema", () => {
  it("accepts a name with optional icon", () => {
    expect(categorySchema.safeParse({ name: "Faith" }).success).toBe(true);
    expect(categorySchema.safeParse({ name: "Faith", icon: "moon" }).success).toBe(true);
  });
  it("requires a non-empty name", () => {
    expect(categorySchema.safeParse({ name: "" }).success).toBe(false);
    expect(categorySchema.safeParse({}).success).toBe(false);
  });
});
