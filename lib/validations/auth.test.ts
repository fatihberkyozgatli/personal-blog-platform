import { describe, it, expect } from "vitest";
import { credentialsSchema } from "./auth";

describe("credentialsSchema", () => {
  it("rejects an invalid email", () => {
    expect(credentialsSchema.safeParse({ email: "nope", password: "longenough" }).success).toBe(false);
  });
  it("rejects a password shorter than 8 chars", () => {
    expect(credentialsSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });
  it("accepts valid credentials", () => {
    expect(credentialsSchema.safeParse({ email: "a@b.com", password: "longenough" }).success).toBe(true);
  });
});
