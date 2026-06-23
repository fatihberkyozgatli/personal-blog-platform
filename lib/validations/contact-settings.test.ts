import { describe, expect, it } from "vitest";
import { contactSettingsSchema } from "./contact-settings";

const valid = {
  email: "hello@example.com",
  location: "Istanbul / Dallas",
  instagramUrl: "https://instagram.com/example",
  youtubeUrl: "",
};

describe("contactSettingsSchema", () => {
  it("accepts valid contact settings and normalizes empty social links", () => {
    const parsed = contactSettingsSchema.parse(valid);
    expect(parsed.youtubeUrl).toBeNull();
  });

  it("rejects invalid email addresses", () => {
    expect(contactSettingsSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects non-https social links", () => {
    expect(contactSettingsSchema.safeParse({ ...valid, instagramUrl: "http://example.com" }).success).toBe(false);
  });
});
