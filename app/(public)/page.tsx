import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Quote } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ButtonLink } from "@/components/shared/Button";
import { Floret, FloretLabel } from "@/components/shared/Ornament";
import { ArchClip, CornerOrnament, Divider } from "@/components/shared/ornament-kit";
import { CoverArt } from "@/components/shared/CoverArt";
import { Reveal, Stagger, StaggerItem } from "@/components/shared/Motion";
import { PostCard, PostRailItem } from "@/components/public/PostCard";
import { CategoryCard } from "@/components/public/CategoryCard";
import { getCategories, getFeaturedPost, getLatestPosts } from "@/lib/data/posts";
import { formatDate } from "@/lib/utils/format";

export default async function LandingPage() {
  const [categories, featured, latest] = await Promise.all([
    getCategories(),
    getFeaturedPost(),
    getLatestPosts(4),
  ]);
  const rail = latest.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden">
        <Container className="grid grid-cols-1 gap-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <Reveal className="relative min-w-0 overflow-hidden rounded-t-[6rem] border border-gold/30 bg-parchment/90 px-6 py-14 shadow-card backdrop-blur-sm sm:px-14">
            <div className="pointer-events-none absolute inset-3 rounded-t-[5.5rem] border border-gold/15" />
            <CornerOrnament corner="bl" />
            <CornerOrnament corner="br" />
            <div className="relative mx-auto max-w-md text-center">
              <Floret className="mx-auto mb-6 h-5 w-5" />
              <h1 className="text-balance break-words font-display text-[2rem] leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
                Thoughts from the <span className="text-maroon">Heart</span>, Stories from the{" "}
                <span className="text-maroon">Soul</span>.
              </h1>
              <Divider className="my-7" />
              <p className="text-[0.95rem] leading-relaxed text-ink-muted">
                A space for personal reflections on life, faith, history, and everything in
                between. Welcome to my journey of thought and discovery.
              </p>
              <div className="mt-8 flex justify-center">
                <ButtonLink href="/blogs">
                  Explore Latest Posts <Floret className="h-3.5 w-3.5 text-ink" />
                </ButtonLink>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="relative min-w-0 rounded-xl2 bg-maroon p-6 shadow-panel sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ivory">Latest Posts</h2>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-1 text-xs font-medium text-gold-400 transition-colors hover:text-ivory"
              >
                View all posts <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {rail.map((p) => (
                <PostRailItem key={p.id} post={p} />
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {featured && (
        <section className="relative overflow-hidden py-16">
          <Container>
            <Reveal className="mb-10 text-center">
              <FloretLabel>The Essay to Begin With</FloretLabel>
            </Reveal>
            <Reveal className="relative rounded-xl border border-gold/40 bg-parchment/70 p-6 shadow-card sm:p-10">
              <CornerOrnament corner="tl" />
              <CornerOrnament corner="tr" />
              <CornerOrnament corner="bl" />
              <CornerOrnament corner="br" />
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
              <ArchClip
                piece="arch-1.svg"
                className="mx-auto aspect-[4/5] w-full max-w-sm shadow-panel"
              >
                <CoverArt
                  src={featured.coverImage}
                  alt={featured.title}
                  seed={featured.slug}
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="h-full w-full"
                />
              </ArchClip>

              <div className="relative">
                {featured.category && (
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
                    {featured.category.name}
                  </span>
                )}
                <h2 className="mt-3 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
                  {featured.title}
                </h2>
                <div className="mt-6 flex gap-3 border-l-2 border-gold pl-5">
                  <Quote className="h-6 w-6 shrink-0 text-gold" />
                  <p className="font-display text-xl italic leading-relaxed text-ink-muted">
                    {featured.excerpt}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDate(featured.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {featured.readingTime} min read
                  </span>
                </div>
                <div className="mt-8">
                  <ButtonLink href={`/blogs/${featured.slug}`} variant="secondary">
                    Read the Essay <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      <section className="py-14">
        <Container>
          <Reveal className="mb-8 text-center">
            <h2 className="font-display text-3xl text-ink">
              <span className="inline-flex items-center gap-3">
                <Floret /> Explore by Category <Floret />
              </span>
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {categories.map((c, i) => (
              <StaggerItem key={c.id}>
                <CategoryCard category={c} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {latest.length > 0 && (
        <section className="py-14">
          <Container>
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-3xl text-ink">Latest Posts</h2>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-1 text-sm font-medium text-maroon transition-colors hover:text-gold-700"
              >
                View all posts <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((p, i) => (
                <StaggerItem key={p.id}>
                  <PostCard post={p} priority={i === 0} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </section>
      )}
    </>
  );
}
