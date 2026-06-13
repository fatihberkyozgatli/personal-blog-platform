"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Category, Tag } from "@/lib/data/types";

const select =
  "rounded-md border border-gold/30 bg-parchment px-3 py-2.5 text-sm text-ink outline-none focus:border-gold cursor-pointer";

export function FilterBar({
  categories,
  tags,
  current,
}: {
  categories: Category[];
  tags: Tag[];
  current: { q?: string; c?: string; tag?: string; sort?: string };
}) {
  const router = useRouter();

  function go(next: Partial<{ q: string; c: string; tag: string; sort: string }>) {
    const params = new URLSearchParams();
    const merged = { ...current, ...next };
    if (merged.q) params.set("q", merged.q);
    if (merged.c) params.set("c", merged.c);
    if (merged.tag) params.set("tag", merged.tag);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
    // changing a filter resets to page 1 (omit page)
    router.push(`/blogs${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="mb-10 flex flex-col gap-3 rounded-xl2 border border-gold/20 bg-parchment p-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = new FormData(e.currentTarget).get("q");
          go({ q: typeof v === "string" ? v : "" });
        }}
        className="relative flex-1"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          name="q"
          defaultValue={current.q ?? ""}
          placeholder="Search posts…"
          aria-label="Search posts"
          className="w-full rounded-md border border-gold/30 bg-ivory py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-gold"
        />
      </form>

      <select
        aria-label="Filter by category"
        className={select}
        value={current.c ?? ""}
        onChange={(e) => go({ c: e.target.value })}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by tag"
        className={select}
        value={current.tag ?? ""}
        onChange={(e) => go({ tag: e.target.value })}
      >
        <option value="">All Tags</option>
        {tags.map((t) => (
          <option key={t.id} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort posts"
        className={select}
        value={current.sort ?? "newest"}
        onChange={(e) => go({ sort: e.target.value })}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="popular">Most Read</option>
      </select>
    </div>
  );
}
