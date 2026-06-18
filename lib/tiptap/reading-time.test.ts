import { describe, it, expect } from "vitest";
import { readingTimeFrom } from "./reading-time";

const docOf = (text: string) => ({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] });

describe("readingTimeFrom", () => {
  it("returns at least 1 minute for short content", () => {
    expect(readingTimeFrom(docOf("a few words"))).toBe(1);
  });
  it("scales with word count (~200 wpm)", () => {
    const words = Array.from({ length: 600 }, () => "word").join(" ");
    expect(readingTimeFrom(docOf(words))).toBe(3);
  });
  it("handles non-object input", () => {
    expect(readingTimeFrom(null)).toBe(1);
  });
});
