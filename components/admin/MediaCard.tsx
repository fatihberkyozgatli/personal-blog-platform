"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Copy, Trash2 } from "lucide-react";
import { deleteMedia } from "@/lib/actions/admin";

export function MediaCard({ id, url, filename }: { id: string; url: string; filename: string }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function onDelete() {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteMedia(id);
      router.refresh();
    });
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-gold/20 bg-parchment">
      <div className="relative aspect-[4/3]">
        <Image src={url} alt={filename} fill className="object-cover" sizes="240px" />
      </div>
      <figcaption className="space-y-2 px-3 py-2">
        <p className="truncate text-xs text-ink-muted" title={url}>
          {filename}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy URL for ${filename}`}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-gold/30 px-2 py-1 text-xs font-medium text-ink transition-colors hover:border-gold hover:text-maroon cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            aria-label={`Delete ${filename}`}
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-clay/30 px-2 py-1 text-clay transition-colors hover:border-clay hover:bg-clay/10 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
