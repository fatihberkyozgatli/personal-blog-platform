import { generateHTML } from "@tiptap/html";
import sanitizeHtml from "sanitize-html";
import { contentExtensions } from "./extensions";

// Defense-in-depth allowlist. The post body JSON is stored verbatim and could be
// crafted via a direct API call, so we sanitize the generated HTML before it is
// injected with dangerouslySetInnerHTML — no event handlers, no unsafe URIs.
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

/** Render a Tiptap JSON document to sanitized HTML for the read-only view. */
export function renderPostHtml(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  try {
    const raw = generateHTML(content as Parameters<typeof generateHTML>[0], contentExtensions);
    return sanitizeHtml(raw, SANITIZE_OPTIONS);
  } catch {
    return "";
  }
}
