import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { SITE_NAME } from "@/lib/site";

export function Logo({
  className,
  showTagline = true,
  tone = "dark",
}: {
  className?: string;
  showTagline?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <Link href="/" className={cn("group inline-flex min-w-0 items-center gap-3", className)}>
      <svg viewBox="0 0 48 48" aria-hidden="true" className="h-9 w-9 text-gold">
        <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <path
          d="M24 8l3.6 8.8L36 13l-3.8 9.2L42 24l-9.8 1.8L36 35l-8.4-3.8L24 40l-3.6-8.8L12 35l3.8-9.2L6 24l9.8-1.8L12 13l8.4 3.8L24 8z"
          fill="currentColor"
        />
        <circle cx="24" cy="24" r="3.4" fill="#6E1423" />
      </svg>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "whitespace-nowrap font-display text-2xl font-semibold tracking-wide",
            tone === "light" ? "text-ivory" : "text-ink",
          )}
        >
          {SITE_NAME}
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.22em]",
              tone === "light" ? "text-ivory/70" : "text-ink-muted",
            )}
          >
            Thoughts. Stories. Reflections.
          </span>
        )}
      </span>
    </Link>
  );
}
