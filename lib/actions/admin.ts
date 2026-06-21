"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";
import { postSchema } from "@/lib/validations/post";
import { categorySchema } from "@/lib/validations/category";
import { readingTimeFrom } from "@/lib/tiptap/reading-time";
import type { Database, Json } from "@/types/database";

export interface ActionState {
  ok: boolean;
  message: string;
}

const notConfigured: ActionState = {
  ok: false,
  message: "Connect Supabase (set NEXT_PUBLIC_SUPABASE_URL) to manage content.",
};
const notAuthorized: ActionState = { ok: false, message: "You are not authorized to do that." };

async function ensureAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured;
  if (!(await ensureAdmin())) return notAuthorized;

  let content: Json;
  try {
    content = JSON.parse(String(formData.get("content") ?? "null"));
  } catch {
    return { ok: false, message: "The editor content could not be saved." };
  }
  const parsed = postSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    status: formData.get("status"),
    content,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const supabase = await createClient();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);

  let setPublishedAt: string | undefined;
  if (parsed.data.status === "published") {
    if (parsed.data.id) {
      const { data: existing } = await supabase
        .from("posts")
        .select("published_at")
        .eq("id", parsed.data.id)
        .maybeSingle();
      if (!existing?.published_at) setPublishedAt = new Date().toISOString();
    } else {
      setPublishedAt = new Date().toISOString();
    }
  }

  const row = {
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt ?? "",
    category_id: parsed.data.categoryId || null,
    cover_image: parsed.data.coverImage || null,
    status: parsed.data.status,
    content: parsed.data.content as Json,
    reading_time: readingTimeFrom(parsed.data.content),
    author_id: user.id,
    ...(setPublishedAt ? { published_at: setPublishedAt } : {}),
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
  if (!isSupabaseConfigured() || !(await ensureAdmin())) return;
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) console.error("deletePost failed:", error.message);
  revalidatePath("/admin/posts");
  revalidatePath("/blogs");
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured;
  if (!(await ensureAdmin())) return notAuthorized;
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    icon: String(formData.get("icon") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name: parsed.data.name, slug: slugify(parsed.data.name), icon: parsed.data.icon ?? null });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return { ok: true, message: `Added "${parsed.data.name}".` };
}

export async function createTag(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured;
  if (!(await ensureAdmin())) return notAuthorized;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Tag name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({ name, slug: slugify(name) });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/tags");
  return { ok: true, message: `Added "${name}".` };
}

export async function updateCategoryIcon(id: string, icon: string): Promise<void> {
  if (!isSupabaseConfigured() || !(await ensureAdmin())) return;
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ icon }).eq("id", id);
  if (error) console.error("updateCategoryIcon failed:", error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}

async function deleteFrom(table: keyof Database["public"]["Tables"], id: string, path: string) {
  if (!isSupabaseConfigured() || !(await ensureAdmin())) return;
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id" as never, id);
  if (error) console.error(`delete from ${table} failed:`, error.message);
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

export async function deleteMedia(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !(await ensureAdmin())) return;
  const supabase = await createClient();
  const { data: row } = await supabase.from("media").select("url").eq("id", id).maybeSingle();
  const marker = "/media/";
  const idx = row?.url.indexOf(marker) ?? -1;
  if (idx !== -1) {
    await supabase.storage.from("media").remove([row!.url.slice(idx + marker.length)]);
  }
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) console.error("deleteMedia failed:", error.message);
  revalidatePath("/admin/media");
}

export async function approveComment(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured() || !(await ensureAdmin())) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .update({ approved: true })
    .eq("id", String(formData.get("id")));
  if (error) console.error("approveComment failed:", error.message);
  revalidatePath("/admin/comments");
}
export async function deleteComment(formData: FormData): Promise<void> {
  await deleteFrom("comments", String(formData.get("id")), "/admin/comments");
}

export async function setFeaturedPost(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured() || !(await ensureAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!post || post.status !== "published") return;

  const { data: current } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "featured_post")
    .maybeSingle();
  const currentId = (current?.value as { post_id?: string | null } | null)?.post_id ?? null;
  const nextId = currentId === id ? null : id;

  const { error } = await supabase.from("site_settings").upsert(
    { key: "featured_post", value: { post_id: nextId } as unknown as Json, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) console.error("setFeaturedPost failed:", error.message);

  revalidatePath("/");
  revalidatePath("/admin/posts");
}
export async function markMessageRead(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured() || !(await ensureAdmin())) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ read: true })
    .eq("id", String(formData.get("id")));
  if (error) console.error("markMessageRead failed:", error.message);
  revalidatePath("/admin/messages");
}
