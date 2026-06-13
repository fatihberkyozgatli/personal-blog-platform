import { cn } from "@/lib/utils/cn";

const BASE = "/ornaments/lib";

type Tint = "gold" | "maroon" | "ink" | "ivory" | "emerald";
const tintClass: Record<Tint, string> = {
  gold: "bg-gold",
  maroon: "bg-maroon",
  ink: "bg-ink",
  ivory: "bg-ivory",
  emerald: "bg-emerald",
};

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

export function Divider({
  tint = "gold",
  className,
}: {
  tint?: Tint;
  className?: string;
}) {
  const mask = `url(${BASE}/divider-unit.svg)`;
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/60 sm:w-20" />
      <span
        className={cn("h-4 w-36", tintClass[tint])}
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskRepeat: "repeat-x",
          maskRepeat: "repeat-x",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "44px 18px",
          maskSize: "44px 18px",
        }}
      />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/60 sm:w-20" />
    </div>
  );
}

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

  const flip = {
    tr: "",
    tl: "-scale-x-100",
    br: "-scale-y-100",
    bl: "-scale-x-100 -scale-y-100",
  }[corner];
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
      size="100% 100%"
      className={cn("pointer-events-none absolute h-9 w-9", pos, flip, className)}
    />
  );
}

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
