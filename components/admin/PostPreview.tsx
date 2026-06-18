"use client";

import { CalendarDays, Clock, Eye } from "lucide-react";
import { CoverArt } from "@/components/shared/CoverArt";
import { OrnamentRule } from "@/components/shared/Ornament";
import { renderPostHtml } from "@/lib/tiptap/render";
import { formatDate } from "@/lib/utils/format";
import { readingTimeFrom } from "@/lib/tiptap/reading-time";
import type { Category, PostStatus } from "@/lib/data/types";

function slugSeed(title: string) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "post-preview";
}

export function PostPreview({
  title,
  excerpt,
  coverImage,
  category,
  content,
  status,
}: {
  title: string;
  excerpt: string;
  coverImage: string;
  category: Category | null;
  content: unknown;
  status: PostStatus;
}) {
  const displayTitle = title.trim() || "Untitled Reflection";
  const html = renderPostHtml(content);
  const hasBody = html.trim().length > 0;
  const date = new Date().toISOString();

  return (
    <div className="overflow-hidden rounded-xl2 border border-gold/25 bg-ivory shadow-card">
      <div className="flex items-center justify-between border-b border-gold/20 bg-parchment px-4 py-3">
        <div>
          <p className="font-display text-lg text-ink">Live Blog Preview</p>
          <p className="text-xs text-ink-muted">Updates from the editor before saving.</p>
        </div>
        <span className="rounded-full border border-gold/30 px-3 py-1 text-xs capitalize text-ink-muted">
          {status}
        </span>
      </div>

      <article className="bg-ivory">
        <div className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs text-ink-muted">Blogs</span>
            {category && (
              <span className="ml-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
                · {category.name}
              </span>
            )}
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {displayTitle}
            </h1>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> {formatDate(date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {readingTimeFrom(content)} min read
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> preview
              </span>
            </div>
            <div className="my-7">
              <OrnamentRule />
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            <CoverArt
              src={coverImage.trim() || null}
              alt={displayTitle}
              seed={slugSeed(displayTitle)}
              sizes="(max-width: 1024px) 100vw, 896px"
              className="aspect-[16/9] w-full rounded-xl2 shadow-card"
            />
          </div>
        </div>

        <div className="px-5 pb-12 sm:px-8">
          <div className="mx-auto max-w-2xl">
            {excerpt.trim() && (
              <p className="mb-6 rounded-lg border border-gold/30 bg-parchment px-4 py-3 text-sm leading-relaxed text-ink-muted">
                {excerpt}
              </p>
            )}

            {hasBody ? (
              <div className="prose-editorial max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <div className="rounded-xl2 border border-dashed border-gold/30 bg-parchment/50 p-8 text-center text-sm text-ink-muted">
                Start writing to preview the post body.
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
