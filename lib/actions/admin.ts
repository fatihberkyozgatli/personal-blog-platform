"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";

export interface ActionState {
  ok: boolean;
  message: string;
}

const notConfigured: ActionState = {
  ok: false,
  message: "Connect Supabase (set NEXT_PUBLIC_SUPABASE_URL) to manage content.",
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Estimate reading time (minutes) from a Tiptap JSON doc. */
function readingTimeFrom(content: unknown): number {
  let text = "";
  const walk = (node: any) => {
    if (!node) return;
    if (typeof node.text === "string") text += node.text + " ";
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(content);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required.").max(200),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(400).optional(),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(["draft", "published"]),
  content: z.string().min(2, "The post body is empty."),
});

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured;

  const parsed = postSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    status: formData.get("status"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  let content: unknown;
  try {
    content = JSON.parse(parsed.data.content);
  } catch {
    return { ok: false, message: "The editor content could not be saved." };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const supabase = await createClient();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const row = {
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt ?? "",
    category_id: parsed.data.categoryId || null,
    cover_image: parsed.data.coverImage || null,
    status: parsed.data.status,
    content,
    reading_time: readingTimeFrom(content),
    author_id: user.id,
    // Publish now if publishing and no date was set yet.
    ...(parsed.data.status === "published" ? { published_at: new Date().toISOString() } : {}),
  };

  if (parsed.data.id) {
    const { error } = await supabase.from("posts").update(row).eq("id", parsed.data.id);
    if (error) return { ok: false, message: error.message };
  } else {
    const { error } = await supabase.from("posts").insert(row);
    if (error) return { ok: false, message: error.message };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blogs");
  redirect("/admin/posts");
}

export async function deletePost(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/admin/posts");
}

// ── Taxonomy ───────────────────────────────────────────────────────────────
export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Category name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name, slug: slugify(name) });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/categories");
  return { ok: true, message: `Added “${name}”.` };
}

export async function createTag(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Tag name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({ name, slug: slugify(name) });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/tags");
  return { ok: true, message: `Added “${name}”.` };
}

async function deleteFrom(table: string, id: string, path: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.from(table).delete().eq("id", id);
  revalidatePath(path);
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await deleteFrom("categories", String(formData.get("id")), "/admin/categories");
}
export async function deleteTag(formData: FormData): Promise<void> {
  await deleteFrom("tags", String(formData.get("id")), "/admin/tags");
}
export async function deleteSubscriber(formData: FormData): Promise<void> {
  await deleteFrom("newsletter_subscribers", String(formData.get("id")), "/admin/subscribers");
}

// ── Moderation & inbox ─────────────────────────────────────────────────────
export async function approveComment(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.from("comments").update({ approved: true }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/comments");
}
export async function deleteComment(formData: FormData): Promise<void> {
  await deleteFrom("comments", String(formData.get("id")), "/admin/comments");
}
export async function markMessageRead(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.from("contact_messages").update({ read: true }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/messages");
}
