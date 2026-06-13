// Domain types shared across the app. These mirror the database schema
// (see documentation/database.md) but stay decoupled from generated DB types
// so UI code reads cleanly.

export type Role = "admin" | "reader";
export type PostStatus = "draft" | "published";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

/** Public-safe post shape (from the `posts_public` view). No body content. */
export interface PostCard {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  excerpt: string;
  category?: Category | null;
  author?: Author | null;
  publishedAt: string | null;
  readingTime: number;
  viewCount: number;
  tags?: Tag[];
}

/** Full post including the gated body (Tiptap JSON). Only for authed reads. */
export interface PostFull extends PostCard {
  content: unknown; // Tiptap JSON document
  status: PostStatus;
  likeCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  parentId: string | null;
  body: string;
  approved: boolean;
  createdAt: string;
  replies?: Comment[];
}
