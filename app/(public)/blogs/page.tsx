import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { OrnamentRule } from "@/components/shared/Ornament";
import { PostCard } from "@/components/public/PostCard";
import { getCategories, getPosts, searchPosts } from "@/lib/data/posts";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Reflections, essays, and histories.",
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string }>;
}) {
  const { q, c } = await searchParams;
  const categories = await getCategories();
  const activeCategory = categories.find((cat) => cat.slug === c) ?? null;

  const posts = q ? await searchPosts(q) : await getPosts({ categorySlug: c });

  const heading = q
    ? `Results for “${q}”`
    : activeCategory
      ? activeCategory.name
      : "All Reflections";

  return (
    <Container className="py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">{heading}</h1>
        <div className="my-5">
          <OrnamentRule />
        </div>
        <p className="text-sm text-ink-muted">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="mx-auto max-w-md rounded-xl2 border border-gold/20 bg-parchment p-10 text-center">
          <p className="font-display text-2xl text-ink">Nothing here yet</p>
          <p className="mt-2 text-sm text-ink-muted">
            {q
              ? "No posts matched your search. Try another phrase."
              : "There are no posts in this section yet. Please check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} priority={i < 3} />
          ))}
        </div>
      )}
    </Container>
  );
}
