import { cn } from "@/lib/utils/cn";

/** An eight-point gold floret used as a divider/accent mark throughout. */
export function Floret({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-3.5 w-3.5 text-gold", className)}
      fill="currentColor"
    >
      <path d="M12 0l2.2 6.3L20 4l-2.3 5.8L24 12l-6.3 2.2L20 20l-5.8-2.3L12 24l-2.2-6.3L4 20l2.3-5.8L0 12l6.3-2.2L4 4l5.8 2.3L12 0z" />
    </svg>
  );
}

/** A horizontal illuminated rule with a centred floret. */
export function OrnamentRule({ className }: { className?: string }) {
  return (
    <div className={cn("ornament-rule", className)} aria-hidden="true">
      <Floret />
    </div>
  );
}

/** A small caption label with florets on either side (e.g. "Featured Post"). */
export function FloretLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold-700">
      <Floret className="h-3 w-3" />
      {children}
      <Floret className="h-3 w-3" />
    </span>
  );
}
