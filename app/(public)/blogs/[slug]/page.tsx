import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye, Lock } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Floret, OrnamentRule } from "@/components/shared/Ornament";
import { CoverArt } from "@/components/shared/CoverArt";
import { ButtonLink } from "@/components/shared/Button";
import { AuthorCard } from "@/components/shared/Portrait";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentSection } from "@/components/public/CommentSection";
import { ShareButtons } from "@/components/public/ShareButtons";
import { ViewPing } from "@/components/public/ViewPing";
import {
  getCommentsForPost,
  getPostContent,
  getPostEngagement,
  getPostTags,
  getPublicPostCard,
  getRelatedPosts,
} from "@/lib/data/posts";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { renderPostHtml } from "@/lib/tiptap/render";
import { formatDate } from "@/lib/utils/format";
import { getAboutContent } from "@/lib/data/about";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostCard(slug);
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
  const post = await getPublicPostCard(slug);
  if (!post) notFound();

  const user = await getCurrentUser();
  const sampleMode = !isSupabaseConfigured();
  const canRead = sampleMode || !!user;

  const [engagement, tags, related, content, comments, about] = await Promise.all([
    getPostEngagement(post.id, user?.id),
    getPostTags(post.id),
    getRelatedPosts(post),
    canRead ? getPostContent(slug) : Promise.resolve(null),
    getCommentsForPost(post.id),
    getAboutContent(),
  ]);
  const bodyHtml = canRead ? renderPostHtml(content) : "";

  return (
    <article>
      <ViewPing slug={slug} />

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/blogs"
            className="font-display text-2xl uppercase tracking-[0.24em] text-maroon transition-colors hover:text-gold-700"
          >
            The Red Diary
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
            <span>essays</span>
            <span className="text-gold-700">/</span>
            {post.category ? (
              <span className="font-semibold text-gold-700">{post.category.name}</span>
            ) : (
              <span>archive</span>
            )}
          </div>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">
            {formatDate(post.publishedAt)}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-[1.02] text-ink sm:text-6xl">
            {post.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            {post.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readingTime} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {post.viewCount.toLocaleString()} views
            </span>
          </div>
          <div className="my-8">
            <OrnamentRule />
          </div>
        </div>

        <div className="mx-auto max-w-3xl rounded-xl2 border border-gold/20 bg-parchment/75 p-2 shadow-card backdrop-blur-[1px]">
          <CoverArt
            src={post.coverImage}
            alt={post.title}
            seed={post.slug}
            priority
            sizes="(max-width: 1024px) 100vw, 768px"
            className="aspect-[16/9] w-full rounded-lg"
          />
        </div>
      </Container>

      <Container className="pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0 rounded-xl2 border border-gold/20 bg-ivory/90 p-5 shadow-card backdrop-blur-[1px] sm:p-8 lg:p-12">
            {canRead ? (
              <>
                {sampleMode && (
                  <p className="mb-6 rounded-lg border border-gold/30 bg-parchment px-4 py-3 text-xs text-ink-muted">
                    <strong className="text-ink">Sample mode:</strong> showing the full post. In
                    production the body is gated — visitors see the excerpt, then sign in to read on.
                  </p>
                )}
                <div className="mb-8 text-center text-gold-700">
                  <Floret className="mx-auto h-4 w-4" />
                </div>
                <div className="prose-editorial mx-auto max-w-2xl" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

                {tags.length > 0 && (
                  <div className="mt-10 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-ink-muted">Tags:</span>
                    {tags.map((t) => (
                      <Link
                        key={t.id}
                        href={`/blogs?tag=${t.slug}`}
                        className="rounded-full border border-gold/30 bg-parchment px-3 py-1 text-xs text-ink transition-colors hover:border-gold hover:text-maroon"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-gold/20 pt-6">
                  <LikeButton
                    postId={post.id}
                    slug={post.slug}
                    initialCount={engagement.likeCount}
                    initialLiked={engagement.liked}
                  />
                  <ShareButtons title={post.title} />
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

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl2 border border-gold/20 bg-parchment p-5 shadow-card">
              <h2 className="font-display text-lg text-ink">Diary Index</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {post.category && (
                  <div>
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-700">
                      Section
                    </dt>
                    <dd className="mt-1 text-ink">{post.category.name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-700">
                    Date
                  </dt>
                  <dd className="mt-1 text-ink">{formatDate(post.publishedAt)}</dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-700">
                    Time
                  </dt>
                  <dd className="mt-1 text-ink">{post.readingTime} min read</dd>
                </div>
              </dl>
            </div>

            <AuthorCard
              name={about.name}
              short={about.short}
              portraitUrl={about.portraitUrl}
              role={about.role}
              location={about.location}
              reading={about.currentlyReading}
              writing={about.currentlyWriting}
            />

            <div className="rounded-xl2 border border-gold/20 bg-parchment p-5 shadow-card">
              <h3 className="mb-3 font-display text-lg text-ink">Share this post</h3>
              <ShareButtons title={post.title} />
            </div>

            {related.length > 0 && (
              <div className="rounded-xl2 border border-gold/20 bg-parchment p-5 shadow-card">
                <h3 className="mb-4 font-display text-lg text-ink">From the Diary Archive</h3>
                <ul className="space-y-4">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link href={`/blogs/${r.slug}`} className="group flex gap-3">
                        <CoverArt
                          src={r.coverImage}
                          alt={r.title}
                          seed={r.slug}
                          sizes="64px"
                          className="h-16 w-16 shrink-0 rounded-md"
                        />
                        <span className="flex flex-col">
                          <span className="font-display text-base leading-snug text-ink transition-colors group-hover:text-maroon">
                            {r.title}
                          </span>
                          <span className="text-xs text-ink-muted">{formatDate(r.publishedAt)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </article>
  );
}

function GateCard({ slug, excerpt }: { slug: string; excerpt: string }) {
  return (
    <div>
      <p className="prose-editorial max-w-none text-lg">{excerpt}</p>
      <div className="relative mt-4">
        <div className="space-y-3" aria-hidden="true">
          {[100, 96, 90, 84].map((w, i) => (
            <div key={i} className="h-3 rounded bg-ink/10" style={{ width: `${w}%`, opacity: 0.55 - i * 0.12 }} />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-parchment to-transparent" />
      </div>

      <div className="mt-8 rounded-xl2 border border-gold/30 bg-parchment p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-gold-700">
          <Lock className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink">Sign in to keep reading</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
          This reflection is reserved for members. Create a free account to read every post.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href={`/login?next=/blogs/${slug}`} variant="secondary">
            Sign In
          </ButtonLink>
          <ButtonLink href="/signup">
            Create Account <Floret className="h-3.5 w-3.5 text-ink" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
