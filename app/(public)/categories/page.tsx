import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { OrnamentRule } from "@/components/shared/Ornament";
import { CategoryCard } from "@/components/public/CategoryCard";
import { PostCard } from "@/components/public/PostCard";
import { getCategories, getPosts } from "@/lib/data/posts";

export const metadata: Metadata = {
  title: "Categories",
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
  const posts = active ? await getPosts({ categorySlug: active.slug }) : [];

  return (
    <Container className="py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Explore by Category</h1>
        <div className="my-5">
          <OrnamentRule />
        </div>
        <p className="mx-auto max-w-lg text-sm text-ink-muted">
          Six threads of thought, woven from faith, history, literature, and the quiet work of
          becoming.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      {active && (
        <section className="mt-16">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-ink">{active.name}</h2>
            <Link href="/categories" className="text-sm font-medium text-maroon hover:text-gold-600">
              Clear filter
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="text-sm text-ink-muted">No posts in this category yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <PostCard key={p.id} post={p} priority={i < 3} />
              ))}
            </div>
          )}
        </section>
      )}
    </Container>
  );
}
