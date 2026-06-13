import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { OrnamentRule } from "@/components/shared/Ornament";
import { CategoryCard } from "@/components/public/CategoryCard";
import { PostCard } from "@/components/public/PostCard";
import { Stagger, StaggerItem } from "@/components/shared/Motion";
import { getCategories, getPosts } from "@/lib/data/posts";

export const metadata: Metadata = {
  title: "Explore by Category",
  description: "Browse reflections by theme.",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const categories = await getCategories();
  const active = categories.find((cat) => cat.slug === c) ?? null;

  const { items: posts } = await getPosts({ categorySlug: active?.slug, perPage: 9, sort: "newest" });

  return (
    <Container className="py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Explore by Category</h1>
        <div className="my-5">
          <OrnamentRule />
        </div>
        <p className="mx-auto max-w-lg text-sm text-ink-muted">
          Six threads of thought, woven from faith, history, literature, and the quiet work of
          becoming. Pick one, or read the latest from every theme below.
        </p>
      </header>

      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.map((cat, i) => (
          <StaggerItem key={cat.id}>
            <CategoryCard category={cat} index={i} />
          </StaggerItem>
        ))}
      </Stagger>

      <section className="mt-16">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-3xl text-ink">
            {active ? active.name : "Latest from Every Theme"}
          </h2>
          {active ? (
            <Link href="/categories" className="text-sm font-medium text-maroon hover:text-gold-700">
              Clear filter
            </Link>
          ) : (
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1 text-sm font-medium text-maroon hover:text-gold-700"
            >
              Full archive <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-ink-muted">No posts in this category yet.</p>
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <StaggerItem key={p.id}>
                <PostCard post={p} priority={i < 3} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </Container>
  );
}
