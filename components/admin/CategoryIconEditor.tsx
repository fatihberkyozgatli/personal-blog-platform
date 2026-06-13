"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { categoryIcons, categoryIconNames, getCategoryIcon } from "@/lib/category-icons";
import { updateCategoryIcon } from "@/lib/actions/admin";
import { cn } from "@/lib/utils/cn";

/** Per-row icon editor: shows the current icon, opens a picker to change it. */
export function CategoryIconEditor({
  id,
  slug,
  icon,
}: {
  id: string;
  slug: string;
  icon?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(icon ?? "");
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const Current = getCategoryIcon({ icon: current || icon, slug });

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(name: string) {
    setCurrent(name);
    setOpen(false);
    startTransition(() => updateCategoryIcon(id, name));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change icon"
        aria-expanded={open}
        disabled={pending}
        className="flex items-center gap-1 rounded-md border border-gold/30 px-2 py-1.5 text-maroon transition-colors hover:border-gold cursor-pointer"
      >
        <Current className="h-4 w-4" />
        <ChevronDown className="h-3 w-3 text-ink-muted" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1 w-56 rounded-md border border-gold/30 bg-ivory p-2 shadow-panel">
          <div className="flex flex-wrap gap-1.5">
            {categoryIconNames.map((name) => {
              const Icon = categoryIcons[name];
              const active = name === (current || icon);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => choose(name)}
                  aria-label={name}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded transition-colors cursor-pointer",
                    active ? "bg-maroon/10 text-maroon" : "text-ink-muted hover:bg-gold/10 hover:text-maroon",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
