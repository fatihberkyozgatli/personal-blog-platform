import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import type { PostCard as PostCardType } from "@/lib/data/types";
import { CoverArt } from "@/components/shared/CoverArt";
import { formatDate } from "@/lib/utils/format";

/** Standard grid card (the "Latest Posts" grid on the landing + listing). */
export function PostCard({ post, priority }: { post: PostCardType; priority?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl2 border border-gold/20 bg-parchment shadow-card transition-shadow duration-300 hover:shadow-panel">
      <Link href={`/blogs/${post.slug}`} className="block">
        <CoverArt
          src={post.coverImage}
          alt={post.title}
          seed={post.slug}
          priority={priority}
          sizes="(max-width: 768px) 100vw, 320px"
          className="aspect-[4/3] w-full"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.category && (
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-700">
            {post.category.name}
          </span>
        )}
        <h3 className="font-display text-xl leading-tight text-ink">
          <Link href={`/blogs/${post.slug}`} className="transition-colors hover:text-maroon">
            {post.title}
          </Link>
        </h3>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readingTime} min
          </span>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>
        <Link
          href={`/blogs/${post.slug}`}
          className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-maroon transition-colors hover:text-gold-700"
        >
          Read More
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

/** Compact row used on the dark "Latest Posts" rail in the hero. */
export function PostRailItem({ post }: { post: PostCardType }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex gap-4 rounded-lg border border-ivory/10 bg-ivory/[0.04] p-3 transition-colors hover:bg-ivory/[0.08]"
    >
      <CoverArt
        src={post.coverImage}
        alt={post.title}
        seed={post.slug}
        sizes="96px"
        className="h-20 w-24 shrink-0 rounded-md"
      />
      <div className="flex flex-col justify-center gap-1">
        {post.category && (
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
            {post.category.name}
          </span>
        )}
        <h3 className="font-display text-lg leading-snug text-ivory">{post.title}</h3>
        <span className="text-xs text-ivory/60">{formatDate(post.publishedAt)}</span>
      </div>
    </Link>
  );
}
