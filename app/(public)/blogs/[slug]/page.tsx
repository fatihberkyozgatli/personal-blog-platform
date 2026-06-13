import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Eye, Lock } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Floret, OrnamentRule } from "@/components/shared/Ornament";
import { CoverArt } from "@/components/shared/CoverArt";
import { ButtonLink } from "@/components/shared/Button";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentSection } from "@/components/public/CommentSection";
import { getCommentsForPost, getPostBySlug } from "@/lib/data/posts";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { renderPostHtml } from "@/lib/tiptap/render";
import { formatDate } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const user = await getCurrentUser();
  const sampleMode = !isSupabaseConfigured();
  const canRead = sampleMode || !!user;

  // Count the view (configured mode only). Fire-and-forget.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.rpc("increment_post_view", { p_slug: slug });
  }

  const comments = canRead ? await getCommentsForPost(post.id) : [];
  const bodyHtml = canRead ? renderPostHtml(post.content) : "";

  return (
    <article>
      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          {post.category && (
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                {post.category.name}
              </span>
            </div>
          )}
          <h1 className="mt-3 text-center font-display text-4xl leading-tight text-ink sm:text-5xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readingTime} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {post.viewCount.toLocaleString()} views
            </span>
          </div>

          <div className="my-7">
            <OrnamentRule />
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <CoverArt
            src={post.coverImage}
            alt={post.title}
            seed={post.slug}
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="aspect-[16/9] w-full rounded-xl2 shadow-card"
          />
        </div>
      </Container>

      <Container className="pb-16">
        <div className="mx-auto max-w-2xl">
          {canRead ? (
            <>
              {sampleMode && (
                <p className="mb-6 rounded-lg border border-gold/30 bg-parchment px-4 py-3 text-xs text-ink-muted">
                  <strong className="text-ink">Sample mode:</strong> showing the full post. In
                  production, the body below is gated and requires a free account to read.
                </p>
              )}
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />

              <div className="mt-10 flex items-center justify-between border-t border-gold/20 pt-6">
                <LikeButton
                  postId={post.id}
                  slug={post.slug}
                  initialCount={post.likeCount}
                  initialLiked={false}
                />
              </div>

              <CommentSection
                postId={post.id}
                slug={post.slug}
                comments={comments}
                canComment={!!user}
              />
            </>
          ) : (
            <GateCard slug={post.slug} excerpt={post.excerpt} />
          )}
        </div>
      </Container>
    </article>
  );
}

function GateCard({ slug, excerpt }: { slug: string; excerpt: string }) {
  return (
    <div>
      <p className="prose-editorial">{excerpt}</p>
      <div className="relative mt-2">
        {/* faded teaser lines */}
        <div className="space-y-3" aria-hidden="true">
          {[100, 95, 88].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded bg-ink/10"
              style={{ width: `${w}%`, opacity: 0.6 - i * 0.18 }}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
      </div>

      <div className="mt-8 rounded-xl2 border border-gold/30 bg-parchment p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-gold">
          <Lock className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink">Sign in to keep reading</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
          The full reflection is reserved for members. Create a free account to read every post.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href={`/login?redirect=/blogs/${slug}`} variant="secondary">
            Sign In
          </ButtonLink>
          <ButtonLink href={`/signup?redirect=/blogs/${slug}`}>
            Create Account <Floret className="h-3.5 w-3.5 text-ink" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
