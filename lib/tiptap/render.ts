import { generateHTML } from "@tiptap/html";
import sanitizeHtml from "sanitize-html";
import { contentExtensions } from "./extensions";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "s", "u", "blockquote", "h2", "h3", "h4",
    "ul", "ol", "li", "a", "img", "hr", "code", "pre", "span",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    img: ["src", "alt"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  disallowedTagsMode: "discard",
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
  },
};

export function renderPostHtml(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  try {
    const raw = generateHTML(content as Parameters<typeof generateHTML>[0], contentExtensions);
    return sanitizeHtml(raw, SANITIZE_OPTIONS);
  } catch {
    return "";
  }
}
