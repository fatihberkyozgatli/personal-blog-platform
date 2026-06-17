import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { hashIndex } from "@/lib/utils/format";
import { Floret } from "./Ornament";

const gradients = [
  "from-maroon via-maroon-700 to-maroon-800",
  "from-persian via-[#2A5E86] to-[#143b5e]",
  "from-emerald via-[#274f43] to-[#1c3a31]",
  "from-clay via-[#8f3f24] to-maroon-800",
  "from-[#7d5a1e] via-gold-600 to-maroon-700",
];

export function CoverArt({
  src,
  alt,
  seed,
  className,
  sizes,
  priority,
}: {
  src?: string | null;
  alt: string;
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const validSrc = src && (src.startsWith("/") || /^https?:\/\//.test(src)) ? src : null;
  if (validSrc) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={validSrc} alt={alt} fill className="object-cover" sizes={sizes} priority={priority} />
      </div>
    );
  }

  const g = gradients[hashIndex(seed, gradients.length)];
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative overflow-hidden bg-gradient-to-br", g, className)}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-ivory/15"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id={`lattice-${seed}`} width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M18 0v36M0 18h36" stroke="currentColor" strokeWidth="0.6" fill="none" />
            <circle cx="18" cy="18" r="3.5" stroke="currentColor" strokeWidth="0.6" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#lattice-${seed})`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <Floret className="h-7 w-7 text-ivory/70" />
      </div>
    </div>
  );
}
