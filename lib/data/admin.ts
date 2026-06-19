import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Category, PostStatus, Tag } from "./types";
import { mockCategories, mockPosts } from "./mock";

export interface AdminStats {
  posts: number;
  published: number;
  drafts: number;
  totalViews: number;
  pendingComments: number;
  subscribers: number;
  unreadMessages: number;
}

export interface AdminPostRow {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  categoryName: string | null;
  viewCount: number;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface PendingComment {
  id: string;
  body: string;
  authorName: string;
  postTitle: string;
  createdAt: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface SubscriberRow {
  id: string;
  email: string;
  createdAt: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    return {
      posts: mockPosts.length,
      published: mockPosts.length,
      drafts: 0,
      totalViews: mockPosts.reduce((s, p) => s + p.viewCount, 0),
      pendingComments: 1,
      subscribers: 0,
      unreadMessages: 0,
    };
  }
  const supabase = await createClient();
  const counts = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("comments").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
    supabase.from("posts").select("view_count"),
  ]);
  const [all, pub, pending, subs, msgs, views] = counts;
  if (all.error) console.error("getAdminStats:", all.error.message);
  if (pub.error) console.error("getAdminStats:", pub.error.message);
  if (pending.error) console.error("getAdminStats:", pending.error.message);
  if (subs.error) console.error("getAdminStats:", subs.error.message);
  if (msgs.error) console.error("getAdminStats:", msgs.error.message);
  if (views.error) console.error("getAdminStats:", views.error.message);
  const totalViews = (views.data ?? []).reduce(
    (s: number, r: { view_count: number }) => s + (r.view_count ?? 0),
    0,
  );
  return {
    posts: all.count ?? 0,
    published: pub.count ?? 0,
    drafts: (all.count ?? 0) - (pub.count ?? 0),
    totalViews,
    pendingComments: pending.count ?? 0,
    subscribers: subs.count ?? 0,
    unreadMessages: msgs.count ?? 0,
  };
}

export async function listPosts(): Promise<AdminPostRow[]> {
  if (!isSupabaseConfigured()) {
    return mockPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      categoryName: p.category?.name ?? null,
      viewCount: p.viewCount,
      publishedAt: p.publishedAt,
      updatedAt: p.publishedAt,
    }));
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, status, view_count, published_at, updated_at, categories(name)")
    .order("updated_at", { ascending: false });
  if (error) console.error("listPosts:", error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status,
    categoryName: r.categories?.name ?? null,
    viewCount: r.view_count ?? 0,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  }));
}

export interface EditablePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  content: unknown;
  status: PostStatus;
  categoryId: string | null;
  publishedAt: string | null;
}

export async function getEditablePost(id: string): Promise<EditablePost | null> {
  if (!isSupabaseConfigured()) {
    const p = mockPosts.find((x) => x.id === id);
    if (!p) return null;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage ?? null,
      content: p.content,
      status: p.status,
      categoryId: p.category?.id ?? null,
      publishedAt: p.publishedAt,
    };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
  if (error) console.error("getEditablePost:", error.message);
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    coverImage: data.cover_image,
    content: data.content,
    status: data.status,
    categoryId: data.category_id,
    publishedAt: data.published_at,
  };
}

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mockCategories;
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) console.error("listCategories:", error.message);
  return (data ?? []) as Category[];
}

export async function listTags(): Promise<Tag[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) console.error("listTags:", error.message);
  return (data ?? []) as Tag[];
}

export async function listPendingComments(): Promise<PendingComment[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "pc1",
        body: "A thoughtful note awaiting approval.",
        authorName: "A Reader",
        postTitle: mockPosts[0].title,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, created_at, profiles(display_name), posts(title)")
    .eq("approved", false)
    .order("created_at", { ascending: false });
  if (error) console.error("listPendingComments:", error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    body: r.body,
    authorName: r.profiles?.display_name ?? "Reader",
    postTitle: r.posts?.title ?? "—",
    createdAt: r.created_at,
  }));
}

export async function listSubscribers(): Promise<SubscriberRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("listSubscribers:", error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    createdAt: r.created_at,
  }));
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  createdAt: string;
}

export async function listMedia(): Promise<MediaItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("id, url, filename, created_at")
    .order("created_at", { ascending: false });
  if (error) console.error("listMedia:", error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    url: r.url,
    filename: r.filename,
    createdAt: r.created_at,
  }));
}

export async function listMessages(): Promise<ContactMessageRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("listMessages:", error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    body: r.body,
    read: r.read,
    createdAt: r.created_at,
  }));
}
