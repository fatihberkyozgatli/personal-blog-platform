import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { OrnamentRule } from "@/components/shared/Ornament";
import { PostCard } from "@/components/public/PostCard";
import { FilterBar } from "@/components/public/FilterBar";
import { Pagination } from "@/components/public/Pagination";
import { Stagger, StaggerItem } from "@/components/shared/Motion";
import { getCategories, getPosts, getTags, type SortOrder } from "@/lib/data/posts";

export const metadata: Metadata = {
  title: "All Blog Posts",
  description: "Reflections, essays, and histories.",
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string; tag?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  const page = Number(sp.page) || 1;
  const sort = (sp.sort as SortOrder) || "newest";
  const result = await getPosts({
    q: sp.q,
    categorySlug: sp.c,
    tagSlug: sp.tag,
    sort,
    page,
    perPage: 9,
  });

  return (
    <Container className="py-12">
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">All Blog Posts</h1>
        <div className="my-5">
          <OrnamentRule />
        </div>
      </header>

      <FilterBar
        categories={categories}
        tags={tags}
        current={{ q: sp.q, c: sp.c, tag: sp.tag, sort }}
      />

      {result.items.length === 0 ? (
        <div className="mx-auto max-w-md rounded-xl2 border border-gold/20 bg-parchment p-10 text-center">
          <p className="font-display text-2xl text-ink">Nothing here yet</p>
          <p className="mt-2 text-sm text-ink-muted">
            {sp.q
              ? "No posts matched your search. Try another phrase."
              : "There are no posts in this section yet. Please check back soon."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-6 text-center text-sm text-ink-muted">
            {result.total} {result.total === 1 ? "post" : "posts"}
          </p>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((p, i) => (
              <StaggerItem key={p.id}>
                <PostCard post={p} priority={i < 3} />
              </StaggerItem>
            ))}
          </Stagger>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            params={{ q: sp.q, c: sp.c, tag: sp.tag, sort: sp.sort }}
          />
        </>
      )}
    </Container>
  );
}
