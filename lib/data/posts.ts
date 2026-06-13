import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Category, Comment, PostCard, Tag } from "./types";
import { mockCategories, mockComments, mockPosts, mockTags } from "./mock";

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

export type SortOrder = "newest" | "oldest" | "popular";

// ── Taxonomy ─────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mockCategories;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description }));
}

export async function getTags(): Promise<Tag[]> {
  if (!isSupabaseConfigured()) return mockTags;
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("*").order("name");
  return (data ?? []) as Tag[];
}

// ── Listing (filters, search, sort, pagination) ────────────────────────────
export interface PostQuery {
  categorySlug?: string;
  tagSlug?: string;
  q?: string;
  sort?: SortOrder;
  page?: number;
  perPage?: number;
}

export interface PostPage {
  items: PostCard[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

function sortMock(posts: PostCard[], sort: SortOrder): PostCard[] {
  const copy = [...posts];
  if (sort === "oldest")
    return copy.sort((a, b) => (a.publishedAt ?? "").localeCompare(b.publishedAt ?? ""));
  if (sort === "popular") return copy.sort((a, b) => b.viewCount - a.viewCount);
  return copy.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function getPosts(query: PostQuery = {}): Promise<PostPage> {
  const page = Math.max(1, query.page ?? 1);
  const perPage = query.perPage ?? 9;
  const sort = query.sort ?? "newest";

  if (!isSupabaseConfigured()) {
    let posts = mockPosts.map((p) => p as PostCard);
    if (query.categorySlug) posts = posts.filter((p) => p.category?.slug === query.categorySlug);
    if (query.tagSlug) posts = posts.filter((p) => p.tags?.some((t) => t.slug === query.tagSlug));
    if (query.q) {
      const l = query.q.toLowerCase();
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(l) || p.excerpt.toLowerCase().includes(l),
      );
    }
    posts = sortMock(posts, sort);
    const total = posts.length;
    const start = (page - 1) * perPage;
    return {
      items: posts.slice(start, start + perPage),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  const supabase = await createClient();
  const categories = await getCategories();

  // Full-text search goes through the RPC (safe columns only).
  if (query.q) {
    const { data } = await supabase.rpc("search_posts", { q: query.q });
    let items = (data ?? []).map((r: Row) => mapCard(r, categories));
    if (query.categorySlug) {
      const cat = categories.find((c) => c.slug === query.categorySlug);
      items = items.filter((p: PostCard) => p.category?.id === cat?.id);
    }
    const total = items.length;
    const start = (page - 1) * perPage;
    return { items: items.slice(start, start + perPage), total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
  }

  let q = supabase.from("posts_public").select("*", { count: "exact" });
  if (query.categorySlug) {
    const cat = categories.find((c) => c.slug === query.categorySlug);
    if (cat) q = q.eq("category_id", cat.id);
  }
  if (sort === "popular") q = q.order("view_count", { ascending: false });
  else q = q.order("published_at", { ascending: sort === "oldest" });

  q = q.range((page - 1) * perPage, page * perPage - 1);
  const { data, count } = await q;
  const total = count ?? 0;
  return {
    items: (data ?? []).map((r: Row) => mapCard(r, categories)),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Convenience for the landing page (no pagination shell). */
export async function getLatestPosts(limit: number): Promise<PostCard[]> {
  const { items } = await getPosts({ perPage: limit, page: 1, sort: "newest" });
  return items;
}

export async function getFeaturedPost(): Promise<PostCard | null> {
  const { items } = await getPosts({ perPage: 1, sort: "popular" });
  return items[0] ?? null;
}

// ── Single post: public card (teaser) vs gated content ─────────────────────

/** Public-safe card for everyone (from posts_public). Null if not published. */
export async function getPublicPostCard(slug: string): Promise<PostCard | null> {
  if (!isSupabaseConfigured()) {
    const p = mockPosts.find((x) => x.slug === slug);
    return p ? (p as PostCard) : null;
  }
  const supabase = await createClient();
  const categories = await getCategories();
  const { data } = await supabase.from("posts_public").select("*").eq("slug", slug).maybeSingle();
  return data ? mapCard(data, categories) : null;
}

/** Gated body (Tiptap JSON). Only returns content to authenticated users (RLS). */
export async function getPostContent(slug: string): Promise<unknown | null> {
  if (!isSupabaseConfigured()) {
    return mockPosts.find((x) => x.slug === slug)?.content ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("content").eq("slug", slug).maybeSingle();
  return data?.content ?? null;
}

export interface Engagement {
  likeCount: number;
  liked: boolean;
}

export async function getPostEngagement(postId: string, userId?: string): Promise<Engagement> {
  if (!isSupabaseConfigured()) {
    const p = mockPosts.find((x) => x.id === postId);
    return { likeCount: p?.likeCount ?? 0, liked: false };
  }
  const supabase = await createClient();
  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  let liked = false;
  if (userId) {
    const { data } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    liked = !!data;
  }
  return { likeCount: count ?? 0, liked };
}

export async function getPostTags(postId: string): Promise<Tag[]> {
  if (!isSupabaseConfigured()) {
    return mockPosts.find((p) => p.id === postId)?.tags ?? [];
  }
  const supabase = await createClient();
  const { data } = await supabase.from("post_tags").select("tags(id, name, slug)").eq("post_id", postId);
  return (data ?? []).map((r: Row) => r.tags).filter(Boolean) as Tag[];
}

export async function getRelatedPosts(post: PostCard, limit = 3): Promise<PostCard[]> {
  const { items } = await getPosts({
    categorySlug: post.category?.slug,
    perPage: limit + 1,
  });
  return items.filter((p) => p.id !== post.id).slice(0, limit);
}

// ── Comments (threaded) ────────────────────────────────────────────────────
function buildTree(all: Comment[]): Comment[] {
  const byId = new Map(all.map((c) => [c.id, { ...c, replies: [] as Comment[] }]));
  const roots: Comment[] = [];
  for (const c of byId.values()) {
    if (c.parentId && byId.has(c.parentId)) byId.get(c.parentId)!.replies!.push(c);
    else roots.push(c);
  }
  return roots;
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) {
    // mock comments already carry their replies
    return mockComments.filter((c) => c.postId === postId);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, post_id, parent_id, body, approved, created_at, profiles(id, display_name, avatar_url)")
    .eq("post_id", postId)
    .eq("approved", true)
    .order("created_at", { ascending: true });

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
  return buildTree(all);
}
