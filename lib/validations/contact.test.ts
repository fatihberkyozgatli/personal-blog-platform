import { describe, it, expect } from "vitest";
import { contactSchema } from "./contact";

const valid = { name: "Ada", email: "a@b.com", body: "Hello there." };

describe("contactSchema", () => {
  it("accepts a valid message (subject optional)", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, subject: "Hi" }).success).toBe(true);
  });
  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
  it("requires name and body", () => {
    expect(contactSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, body: "" }).success).toBe(false);
  });
});
