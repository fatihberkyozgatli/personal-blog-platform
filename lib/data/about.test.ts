import { describe, it, expect } from "vitest";
import { aboutSchema } from "@/lib/validations/about";
import { defaultAbout, getAboutContent } from "./about";

describe("defaultAbout", () => {
  it("satisfies the about schema", () => {
    expect(aboutSchema.safeParse(defaultAbout).success).toBe(true);
  });
});

describe("getAboutContent", () => {
  it("returns the defaults when Supabase is not configured", async () => {
    const about = await getAboutContent();
    expect(about).toEqual(defaultAbout);
  });
});
