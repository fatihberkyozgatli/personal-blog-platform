export function readingTimeFrom(content: unknown): number {
  let text = "";
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { text?: unknown; content?: unknown };
    if (typeof n.text === "string") text += n.text + " ";
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(content);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
