import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page,
  totalPages,
  params,
  basePath = "/blogs",
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "page") sp.set(k, v);
    });
    if (p > 1) sp.set("page", String(p));
    return `${basePath}${sp.toString() ? `?${sp}` : ""}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          aria-label="Previous page"
          className="grid h-9 w-9 place-items-center rounded-md border border-gold/30 text-ink-muted hover:border-gold hover:text-maroon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "grid h-9 min-w-9 place-items-center rounded-md border px-3 text-sm tabular-nums transition-colors",
            p === page
              ? "border-maroon bg-maroon text-ivory"
              : "border-gold/30 text-ink-muted hover:border-gold hover:text-maroon",
          )}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          href={href(page + 1)}
          aria-label="Next page"
          className="grid h-9 w-9 place-items-center rounded-md border border-gold/30 text-ink-muted hover:border-gold hover:text-maroon"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
