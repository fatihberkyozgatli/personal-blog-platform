"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";

export function MediaCard({ url, filename }: { url: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-gold/20 bg-parchment">
      <div className="relative aspect-[4/3]">
        <Image src={url} alt={filename} fill className="object-cover" sizes="240px" />
      </div>
      <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="min-w-0 truncate text-xs text-ink-muted" title={url}>
          {filename}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy URL for ${filename}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gold/30 px-2 py-1 text-xs font-medium text-ink transition-colors hover:border-gold hover:text-maroon cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </figcaption>
    </figure>
  );
}
