"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
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
  const reduceMotion = useReducedMotion();
  const hasActiveFilters = Boolean(
    current.q || current.c || current.tag || (current.sort && current.sort !== "newest"),
  );

  function go(next: Partial<{ q: string; c: string; tag: string; sort: string }>) {
    const params = new URLSearchParams();
    const merged = { ...current, ...next };
    if (merged.q) params.set("q", merged.q);
    if (merged.c) params.set("c", merged.c);
    if (merged.tag) params.set("tag", merged.tag);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);

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

      <AnimatePresence initial={false}>
        {hasActiveFilters && (
          <motion.button
            key="clear-filters"
            type="button"
            onClick={() => router.push("/blogs")}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28, width: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, width: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28, width: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-md border border-gold/30 px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-gold hover:text-maroon cursor-pointer"
          >
            <X className="h-4 w-4 shrink-0" />
            Clear
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
