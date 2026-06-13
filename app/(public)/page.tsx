import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ButtonLink } from "@/components/shared/Button";
import { Floret, FloretLabel, OrnamentRule } from "@/components/shared/Ornament";
import { FloralBorder } from "@/components/shared/ornaments";
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
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* signature floral arabesque border, left edge (desktop) */}
        <FloralBorder className="pointer-events-none absolute left-0 top-0 hidden h-full w-24 opacity-90 lg:block" />
        <Container className="grid gap-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16 lg:pl-24">
          <Reveal className="relative rounded-t-[6rem] border border-gold/30 bg-parchment px-8 py-14 shadow-card sm:px-14">
            <div className="pointer-events-none absolute inset-3 rounded-t-[5.5rem] border border-gold/15" />
            {/* slim floral border for mobile, inside the panel's top */}
            <FloralBorder className="pointer-events-none absolute -left-1 top-6 block h-[85%] w-10 opacity-80 lg:hidden" />
            <div className="relative mx-auto max-w-md text-center">
              <Floret className="mx-auto mb-6 h-5 w-5" />
              <h1 className="font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
                Thoughts from the <span className="text-maroon">Heart</span>, Stories from the{" "}
                <span className="text-maroon">Soul</span>.
              </h1>
              <div className="my-7">
                <OrnamentRule />
              </div>
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

          <Reveal delay={0.12} className="rounded-xl2 bg-maroon p-6 shadow-panel sm:p-8">
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

      {/* ── Featured ───────────────────────────────────────── */}
      {featured && (
        <section className="py-14">
          <Container>
            <Reveal className="grid items-center gap-8 lg:grid-cols-2">
              <CoverArt
                src={featured.coverImage}
                alt={featured.title}
                seed={featured.slug}
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="aspect-[5/4] w-full rounded-xl2 shadow-card"
              />
              <div>
                <FloretLabel>Featured Post</FloretLabel>
                <h2 className="mt-3 font-display text-4xl leading-tight text-ink">{featured.title}</h2>
                <p className="mt-4 leading-relaxed text-ink-muted">{featured.excerpt}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                  {featured.category && (
                    <span className="inline-flex items-center gap-1">
                      <Floret className="h-3 w-3" /> {featured.category.name}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDate(featured.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {featured.readingTime} min read
                  </span>
                </div>
                <div className="mt-7">
                  <ButtonLink href={`/blogs/${featured.slug}`} variant="secondary">
                    Read More <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {/* ── Explore by Category ────────────────────────────── */}
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
            {categories.map((c) => (
              <StaggerItem key={c.id}>
                <CategoryCard category={c} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ── Latest Posts grid ──────────────────────────────── */}
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
