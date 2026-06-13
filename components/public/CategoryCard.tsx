import Link from "next/link";
import type { Category } from "@/lib/data/types";
import { Floret } from "@/components/shared/Ornament";

/** Arched "Explore by Category" card with a gold floral emblem. */
export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories?c=${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-t-[2.5rem] border border-gold/30 bg-parchment px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-card"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-gold transition-colors group-hover:bg-gold/10">
        <Floret className="h-5 w-5" />
      </span>
      <span className="font-display text-lg text-ink">{category.name}</span>
    </Link>
  );
}
