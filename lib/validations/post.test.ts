import { describe, it, expect } from "vitest";
import { postSchema } from "./post";

const doc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x" }] }] };
const valid = { title: "T", status: "draft", content: doc };

describe("postSchema", () => {
  it("accepts a valid post with a Tiptap doc", () => {
    expect(postSchema.safeParse(valid).success).toBe(true);
  });
  it("requires a title", () => {
    expect(postSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });
  it("rejects a bad status", () => {
    expect(postSchema.safeParse({ ...valid, status: "live" }).success).toBe(false);
  });
  it("rejects content that is not a doc object", () => {
    expect(postSchema.safeParse({ ...valid, content: "x" }).success).toBe(false);
    expect(postSchema.safeParse({ ...valid, content: {} }).success).toBe(false);
    expect(postSchema.safeParse({ ...valid, content: [] }).success).toBe(false);
  });
});
