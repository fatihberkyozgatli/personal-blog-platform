"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Category, Tag } from "@/lib/data/types";
import { Select } from "./Select";

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

      <Select
        ariaLabel="Filter by category"
        className="sm:w-44"
        value={current.c ?? ""}
        onChange={(v) => go({ c: v })}
        options={[
          { value: "", label: "All Categories" },
          ...categories.map((c) => ({ value: c.slug, label: c.name })),
        ]}
      />

      <Select
        ariaLabel="Filter by tag"
        className="sm:w-40"
        value={current.tag ?? ""}
        onChange={(v) => go({ tag: v })}
        options={[
          { value: "", label: "All Tags" },
          ...tags.map((t) => ({ value: t.slug, label: t.name })),
        ]}
      />

      <Select
        ariaLabel="Sort posts"
        className="sm:w-40"
        value={current.sort ?? "newest"}
        onChange={(v) => go({ sort: v })}
        options={[
          { value: "newest", label: "Newest First" },
          { value: "oldest", label: "Oldest First" },
          { value: "popular", label: "Most Read" },
        ]}
      />
    </div>
  );
}
