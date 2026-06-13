"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function url() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function nativeShare() {
    const u = url();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: u });
      } catch {

      }
    } else {
      await copy();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {

    }
  }

  const btn =
    "grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-ink-muted transition-colors hover:border-gold hover:text-maroon cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={nativeShare} aria-label="Share this post" className={btn}>
        <Share2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={copy} aria-label="Copy link" className={btn}>
        {copied ? <Check className="h-4 w-4 text-emerald" /> : <Link2 className="h-4 w-4" />}
      </button>
      {copied && <span className="text-xs text-emerald">Link copied</span>}
    </div>
  );
}
