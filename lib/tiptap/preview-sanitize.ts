const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "blockquote",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "hr",
  "code",
  "pre",
  "span",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "rel", "target"]),
  img: new Set(["src", "alt"]),
};

const DROP_WITH_CONTENT = new Set(["script", "style", "iframe", "object", "embed"]);

function isSafeUrl(value: string, protocols: string[]) {
  try {
    const url = new URL(value, window.location.origin);
    return protocols.includes(url.protocol.replace(":", ""));
  } catch {
    return false;
  }
}

export function sanitizePreviewHtml(html: string): string {
  if (!html.trim() || typeof DOMParser === "undefined") return "";

  const doc = new DOMParser().parseFromString(html, "text/html");

  for (const el of Array.from(doc.body.querySelectorAll("*"))) {
    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      el.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      el.replaceWith(...Array.from(el.childNodes));
      continue;
    }

    const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!allowed.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (tag === "a" && name === "href" && !isSafeUrl(attr.value, ["http", "https", "mailto"])) {
        el.removeAttribute(attr.name);
      }

      if (tag === "img" && name === "src" && !isSafeUrl(attr.value, ["http", "https"])) {
        el.removeAttribute(attr.name);
      }
    }

    if (tag === "a" && el.hasAttribute("href")) {
      el.setAttribute("rel", "noopener noreferrer nofollow");
      el.setAttribute("target", "_blank");
    }
  }

  return doc.body.innerHTML;
}
