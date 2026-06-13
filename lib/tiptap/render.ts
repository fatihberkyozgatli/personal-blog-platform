import { generateHTML } from "@tiptap/html";
import { contentExtensions } from "./extensions";

/** Render a Tiptap JSON document to HTML for the public, read-only view. */
export function renderPostHtml(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  try {
    // generateHTML expects a JSONContent doc.
    return generateHTML(content as Parameters<typeof generateHTML>[0], contentExtensions);
  } catch {
    return "";
  }
}
