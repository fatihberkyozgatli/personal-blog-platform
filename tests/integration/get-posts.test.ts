import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabase } from "../helpers/mock-supabase";

const supabaseConfigured = vi.fn(() => true);
let mock = makeSupabase();

vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => supabaseConfigured() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => mock.client }));

import { getPosts } from "@/lib/data/posts";

beforeEach(() => {
  mock = makeSupabase({
    categories: { data: [], error: null },
    tags: { data: { id: "t1", slug: "faith" }, error: null },
    post_tags: { data: [{ post_id: "p1" }], error: null },
    posts_public: { data: [], count: 0, error: null },
  });
  supabaseConfigured.mockReturnValue(true);
});

describe("getPosts search branch pagination", () => {
  it("returns correct slice, total, and totalPages for page 2 of 12 results", async () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i + 1}`,
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      cover_image: null,
      excerpt: "x",
      category_id: null,
      author_id: null,
      author_name: null,
      published_at: null,
      reading_time: 0,
      view_count: 0,
    }));
    mock = makeSupabase({ categories: { data: [], error: null } }, { data: rows, error: null });
    const result = await getPosts({ q: "x", page: 3, perPage: 5 });
    expect(result.total).toBe(12);
    expect(result.totalPages).toBe(3);
    expect(result.items.length).toBe(2);
    expect(result.items[0].id).toBe("p11");
    expect(result.items[1].id).toBe("p12");
  });
});

describe("getPosts search branch: sort handling", () => {
  const searchRows = [
    { id: "p1", title: "Post 1", slug: "post-1", cover_image: null, excerpt: "x", category_id: null, author_id: null, author_name: null, published_at: null, reading_time: 0, view_count: 1 },
    { id: "p2", title: "Post 2", slug: "post-2", cover_image: null, excerpt: "x", category_id: null, author_id: null, author_name: null, published_at: null, reading_time: 0, view_count: 9 },
    { id: "p3", title: "Post 3", slug: "post-3", cover_image: null, excerpt: "x", category_id: null, author_id: null, author_name: null, published_at: null, reading_time: 0, view_count: 5 },
  ];

  it("orders by view_count desc when sort=popular is provided", async () => {
    mock = makeSupabase({ categories: { data: [], error: null } }, { data: searchRows, error: null });
    const result = await getPosts({ q: "x", sort: "popular" });
    expect(result.items.map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
  });

  it("preserves RPC relevance order when no sort is provided", async () => {
    mock = makeSupabase({ categories: { data: [], error: null } }, { data: searchRows, error: null });
    const result = await getPosts({ q: "x" });
    expect(result.items.map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });
});

describe("getPosts tag filtering (Supabase branch)", () => {
  it("queries tags and post_tags tables when tagSlug is provided", async () => {
    await getPosts({ tagSlug: "faith" });
    expect(mock.calls.some((c) => c.table === "tags")).toBe(true);
    expect(mock.calls.some((c) => c.table === "post_tags")).toBe(true);
  });

  it("queries posts_public after resolving tag", async () => {
    await getPosts({ tagSlug: "faith" });
    expect(mock.calls.some((c) => c.table === "posts_public")).toBe(true);
  });

  it("returns empty page when tag slug does not resolve", async () => {
    mock = makeSupabase({
      categories: { data: [], error: null },
      tags: { data: null, error: null },
    });
    const result = await getPosts({ tagSlug: "nonexistent" });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(mock.calls.some((c) => c.table === "posts_public")).toBe(false);
  });

  it("does not query tags or post_tags when no tagSlug is given", async () => {
    await getPosts({});
    expect(mock.calls.some((c) => c.table === "tags")).toBe(false);
    expect(mock.calls.some((c) => c.table === "post_tags")).toBe(false);
  });
});
