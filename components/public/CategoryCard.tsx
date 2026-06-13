import Link from "next/link";
import type { Category } from "@/lib/data/types";
import { ArchClip } from "@/components/shared/ornament-kit";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils/cn";

// Each category gets a distinct accent so the row reads as six themes, not one.
const accents = [
  "from-maroon to-maroon-800",
  "from-persian to-[#143b5e]",
  "from-emerald to-[#1c3a31]",
  "from-clay to-maroon-800",
  "from-[#9a7a2e] to-maroon-700",
  "from-maroon-700 to-persian",
];

/**
 * Arched "Explore by Category" tile: a Persian arch silhouette emblem + name,
 * with a per-category accent and a hover lift. Comfortable 2-up on mobile.
 */
export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  const accent = accents[index % accents.length];
  const Icon = getCategoryIcon({ icon: category.icon, slug: category.slug });
  return (
    <Link
      href={`/categories?c=${category.slug}`}
      className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-gold/30 bg-parchment px-3 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-card sm:rounded-t-[2.25rem] sm:py-6"
    >
      <span className="relative h-14 w-11">
        <ArchClip piece="arch-1.svg" className="absolute inset-0">
          <span className={cn("block h-full w-full bg-gradient-to-b", accent)} />
        </ArchClip>
        <Icon className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-[60%] text-ivory/90 transition-transform duration-300 group-hover:scale-110" />
      </span>
      <span className="font-display text-base leading-tight text-ink sm:text-lg">
        {category.name}
      </span>
    </Link>
  );
}
