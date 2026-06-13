import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Category, Comment, PostCard, PostFull } from "./types";
import { mockCategories, mockComments, mockPosts } from "./mock";

// ── Mappers ────────────────────────────────────────────────────────────────

// DB rows are dynamically shaped (snake_case columns from views/joins).
type Row = Record<string, any>;

function mapCard(row: Row, categories: Category[]): PostCard {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    coverImage: row.cover_image,
    excerpt: row.excerpt,
    category: categories.find((c) => c.id === row.category_id) ?? null,
    author: row.author_name ? { id: row.author_id, displayName: row.author_name } : null,
    publishedAt: row.published_at,
    readingTime: row.reading_time ?? 0,
    viewCount: row.view_count ?? 0,
  };
}

// ── Reads ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mockCategories;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));
}

export async function getPosts(opts: {
  categorySlug?: string;
  limit?: number;
} = {}): Promise<PostCard[]> {
  if (!isSupabaseConfigured()) {
    let posts = mockPosts.map((p) => p as PostCard);
    if (opts.categorySlug) posts = posts.filter((p) => p.category?.slug === opts.categorySlug);
    return opts.limit ? posts.slice(0, opts.limit) : posts;
  }

  const supabase = await createClient();
  const categories = await getCategories();
  let query = supabase
    .from("posts_public")
    .select("*")
    .order("published_at", { ascending: false });

  if (opts.categorySlug) {
    const cat = categories.find((c) => c.slug === opts.categorySlug);
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (opts.limit) query = query.limit(opts.limit);

  const { data } = await query;
  return (data ?? []).map((row) => mapCard(row, categories));
}

/** The most-viewed recent post, used for the "Featured" block. */
export async function getFeaturedPost(): Promise<PostCard | null> {
  if (!isSupabaseConfigured()) {
    return [...mockPosts].sort((a, b) => b.viewCount - a.viewCount)[0] ?? null;
  }
  const supabase = await createClient();
  const categories = await getCategories();
  const { data } = await supabase
    .from("posts_public")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(1);
  const row = data?.[0];
  return row ? mapCard(row, categories) : null;
}

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  if (!isSupabaseConfigured()) {
    return mockPosts.find((p) => p.slug === slug) ?? null;
  }
  const supabase = await createClient();
  const categories = await getCategories();
  // Full row (incl. content) — RLS only returns it to authenticated users.
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).single();
  if (!data) return null;
  const card = mapCard(data, categories);
  return {
    ...card,
    content: data.content,
    status: data.status,
    likeCount: 0,
  };
}

export async function searchPosts(q: string): Promise<PostCard[]> {
  const term = q.trim();
  if (!term) return [];
  if (!isSupabaseConfigured()) {
    const lower = term.toLowerCase();
    return mockPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) || p.excerpt.toLowerCase().includes(lower),
    ) as PostCard[];
  }
  const supabase = await createClient();
  const categories = await getCategories();
  const { data } = await supabase.rpc("search_posts", { q: term });
  return (data ?? []).map((row: Row) => mapCard(row, categories));
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) {
    return mockComments.filter((c) => c.postId === postId);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, post_id, parent_id, body, approved, created_at, profiles(id, display_name, avatar_url)")
    .eq("post_id", postId)
    .eq("approved", true)
    .order("created_at", { ascending: true });

  // Flat list → threaded (one level).
  const all: Comment[] = (data ?? []).map((c: Row) => ({
    id: c.id,
    postId: c.post_id,
    parentId: c.parent_id,
    body: c.body,
    approved: c.approved,
    createdAt: c.created_at,
    author: {
      id: c.profiles?.id ?? "",
      displayName: c.profiles?.display_name ?? "Reader",
      avatarUrl: c.profiles?.avatar_url,
    },
  }));
  const roots = all.filter((c) => !c.parentId);
  for (const root of roots) {
    root.replies = all.filter((c) => c.parentId === root.id);
  }
  return roots;
}
