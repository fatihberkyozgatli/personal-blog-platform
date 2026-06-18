import { describe, it, expect } from "vitest";
import { aboutSchema } from "./about";

const valid = {
  name: "The Author",
  short: "Writer of quiet essays.",
  portraitUrl: null,
  intro: { type: "doc", content: [] },
  bio: { type: "doc", content: [] },
  why: { type: "doc", content: [] },
  favoriteQuote: { text: "A quote.", source: "Someone" },
  timeline: [{ year: "2016", label: "Filled the first notebook." }],
};

describe("aboutSchema", () => {
  it("accepts a well-formed about document", () => {
    expect(aboutSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing name", () => {
    const rest: Partial<typeof valid> = { ...valid };
    delete rest.name;
    expect(aboutSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects a timeline entry without a label", () => {
    const bad = { ...valid, timeline: [{ year: "2016", label: "" }] };
    expect(aboutSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts a https portrait url", () => {
    const ok = { ...valid, portraitUrl: "https://example.com/p.jpg" };
    expect(aboutSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects an http portrait url", () => {
    const bad = { ...valid, portraitUrl: "http://example.com/p.jpg" };
    expect(aboutSchema.safeParse(bad).success).toBe(false);
  });
});
