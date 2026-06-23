import Image from "next/image";
import Link from "next/link";
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
  role = "writer / reader",
  location = "Istanbul / Dallas",
  reading = "The Museum of Innocence",
  writing = "essay on memory",
}: {
  name: string;
  short: string;
  portraitUrl?: string | null;
  role?: string;
  location?: string;
  reading?: string;
  writing?: string;
}) {
  const details = [
    ["Location", location],
    ["Reading", reading],
    ["Writing", writing],
  ] satisfies [string, string][];
  const visibleDetails = details.filter(([, value]) => value);

  return (
    <div className="rounded-xl2 border border-gold/20 bg-parchment p-5 shadow-card">
      <div className="flex items-start gap-4">
        <Portrait src={portraitUrl} name={name} size={72} />
        <div className="min-w-0 pt-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
            The Author
          </p>
          <h3 className="mt-1 font-display text-2xl leading-none text-maroon">{name}</h3>
          {role && (
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-muted">{role}</p>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ink-muted">{short}</p>

      <div className="my-5 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <dl className="space-y-3">
        {visibleDetails.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-700">
              {label}
            </dt>
            <dd className="mt-1 text-sm leading-snug text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href="/about"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-maroon transition-colors hover:text-gold-700"
      >
        Read more <Floret className="h-2.5 w-2.5 text-gold-700" />
      </Link>
    </div>
  );
}
