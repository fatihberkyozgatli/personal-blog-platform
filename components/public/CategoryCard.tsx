import Link from "next/link";
import type { Category } from "@/lib/data/types";
import { Floret } from "@/components/shared/Ornament";

/**
 * Arched "Explore by Category" tile. Compact and comfortable at 2-up on mobile,
 * arched on larger screens. Long names (e.g. "Personal Growth") wrap cleanly.
 */
export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories?c=${category.slug}`}
      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gold/30 bg-parchment px-3 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-card sm:rounded-t-[2.25rem] sm:gap-3 sm:py-6"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/40 text-gold transition-colors group-hover:bg-gold/10 sm:h-12 sm:w-12">
        <Floret className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <span className="font-display text-base leading-tight text-ink sm:text-lg">
        {category.name}
      </span>
    </Link>
  );
}
