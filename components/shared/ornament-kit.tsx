import { cn } from "@/lib/utils/cn";

/**
 * Reusable "illuminated manuscript" decorative system, backed by the sliced
 * ornament assets in /public/ornaments/lib. Line-art pieces are rendered as CSS
 * masks so they tint to the palette via the `color-*` Tailwind utility on the
 * element (we map it through `backgroundColor: currentColor` on a colored span).
 * Swap the underlying SVG/PNG files later without touching components.
 */

const BASE = "/ornaments/lib";

type Tint = "gold" | "maroon" | "ink" | "ivory" | "emerald";
const tintClass: Record<Tint, string> = {
  gold: "bg-gold",
  maroon: "bg-maroon",
  ink: "bg-ink",
  ivory: "bg-ivory",
  emerald: "bg-emerald",
};

/** A single mask-tinted ornament. `src` is a file under /ornaments/lib. */
function Masked({
  src,
  tint = "gold",
  repeat = false,
  size = "contain",
  className,
  style,
}: {
  src: string;
  tint?: Tint;
  repeat?: boolean;
  size?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const mask = `url(${BASE}/${src})`;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block", tintClass[tint], className)}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: repeat ? "repeat" : "no-repeat",
        maskRepeat: repeat ? "repeat" : "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: size,
        maskSize: size,
        ...style,
      }}
    />
  );
}

/** Horizontal section divider flourish (gold by default). */
export function Divider({
  tint = "gold",
  className,
}: {
  tint?: Tint;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Masked src="divider-2.svg" tint={tint} className="h-5 w-64 opacity-90 sm:w-80" />
    </div>
  );
}

/** A corner ornament; rotates to sit in any corner. */
export function CornerOrnament({
  corner = "tl",
  tint = "gold",
  piece = "corner-9.svg",
  className,
}: {
  corner?: "tl" | "tr" | "bl" | "br";
  tint?: Tint;
  piece?: string;
  className?: string;
}) {
  const rot = { tl: "rotate-0", tr: "rotate-90", br: "rotate-180", bl: "-rotate-90" }[corner];
  const pos = {
    tl: "left-2 top-2",
    tr: "right-2 top-2",
    br: "bottom-2 right-2",
    bl: "bottom-2 left-2",
  }[corner];
  return (
    <Masked
      src={piece}
      tint={tint}
      className={cn("pointer-events-none absolute h-10 w-10", pos, rot, className)}
    />
  );
}

/** A vertical geometric interlace border (tileable). */
export function GeometricBorder({
  tint = "gold",
  piece = "border-3.svg",
  className,
}: {
  tint?: Tint;
  piece?: string;
  className?: string;
}) {
  return (
    <Masked
      src={piece}
      tint={tint}
      repeat
      size="auto 100%"
      className={cn("pointer-events-none w-3", className)}
    />
  );
}

/**
 * Faint repeating pattern background. Sits behind content at low opacity.
 * Place inside a `relative` parent.
 */
export function PatternBg({
  opacity = 0.05,
  size = 360,
  className,
}: {
  opacity?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{
        backgroundImage: `url(${BASE}/pattern-soft.png)`,
        backgroundSize: `${size}px`,
        opacity,
      }}
    />
  );
}

/** Colored Persian floral accent (e.g. creeping from a corner). Decorative. */
export function FloralAccent({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none bg-contain bg-no-repeat", className)}
      style={{ backgroundImage: `url(${BASE}/floral-spray.png)`, ...style }}
    />
  );
}

/**
 * Wrap content in a Persian arch silhouette (the content is clipped to the arch
 * shape). Great for featured images and portraits.
 */
export function ArchClip({
  piece = "arch-1.svg",
  className,
  children,
}: {
  piece?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const mask = `url(${BASE}/${piece})`;
  return (
    <div
      className={cn("relative", className)}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    >
      {children}
    </div>
  );
}

/** An outlined Persian arch frame drawn around content. */
export function ArchFrame({
  piece = "arch-11.svg",
  tint = "gold",
  className,
  children,
}: {
  piece?: string;
  tint?: Tint;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      <Masked
        src={piece}
        tint={tint}
        size="100% 100%"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
