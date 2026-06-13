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

export interface PostFull extends PostCard {
  content: unknown;
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
