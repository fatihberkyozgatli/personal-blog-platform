import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Floret } from "./Ornament";

export function Portrait({
  src,
  name,
  size = 96,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "✦";
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-gold/60" />
      <div className="absolute inset-[3px] overflow-hidden rounded-full border border-gold/30 bg-gradient-to-br from-maroon to-maroon-800">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" sizes={`${size}px`} />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="font-display text-2xl text-gold-400">{initial}</span>
          </div>
        )}
      </div>
      <Floret className="absolute -bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 text-gold" />
    </div>
  );
}

export function AuthorCard({
  name,
  short,
  portraitUrl,
}: {
  name: string;
  short: string;
  portraitUrl?: string | null;
}) {
  return (
    <div className="rounded-xl2 border border-gold/20 bg-parchment p-5 text-center shadow-card">
      <h3 className="mb-4 font-display text-lg text-ink">About the Author</h3>
      <div className="flex flex-col items-center gap-3">
        <Portrait src={portraitUrl} name={name} size={88} />
        <p className="font-display text-xl text-maroon">{name}</p>
        <p className="text-sm leading-relaxed text-ink-muted">{short}</p>
      </div>
    </div>
  );
}
