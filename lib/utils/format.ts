/** Format an ISO date as e.g. "May 18, 2024". */
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Deterministic 0..n-1 index from a string (for picking cover-art gradients). */
export function hashIndex(input: string, buckets: number): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % buckets;
}
