import { describe, it, expect } from "vitest";
import { renderPostHtml } from "./render";

const docWith = (nodes: unknown[]) => ({ type: "doc", content: nodes });

describe("renderPostHtml", () => {
  it("renders a paragraph", () => {
    const html = renderPostHtml(docWith([{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }]));
    expect(html).toContain("Hello");
    expect(html).toContain("<p");
  });
  it("returns empty string for null/non-object", () => {
    expect(renderPostHtml(null)).toBe("");
    expect(renderPostHtml("nope")).toBe("");
  });
  it("strips disallowed tags / attributes from a link", () => {
    const html = renderPostHtml(
      docWith([
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "link",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ]),
    );
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<script");
  });
});
