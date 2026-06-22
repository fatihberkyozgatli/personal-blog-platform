"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";
import { isLikelyBot } from "@/lib/utils/spam-guard";

export interface CommentState {
  ok: boolean;
  message: string;
}

const commentSchema = z.object({
  postId: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  body: z.string().min(1, "Please write something.").max(4000),
});

export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  if (isLikelyBot(formData)) {
    return { ok: true, message: "Thank you. Your comment will appear once it has been approved." };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to join the conversation." };

  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    slug: formData.get("slug"),
    parentId: formData.get("parentId") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    post_id: parsed.data.postId,
    user_id: user.id,
    parent_id: parsed.data.parentId ?? null,
    body: parsed.data.body,
    approved: false,
  });
  if (error) return { ok: false, message: "Could not post your comment. Please try again." };

  revalidatePath(`/blogs/${parsed.data.slug}`);
  return { ok: true, message: "Thank you. Your comment will appear once it has been approved." };
}

export interface LikeResult {
  liked: boolean;
  count: number;
  needsAuth?: boolean;
}

export async function toggleLike(postId: string, slug: string): Promise<LikeResult> {
  if (!isSupabaseConfigured()) return { liked: false, count: 0, needsAuth: true };

  const user = await getCurrentUser();
  if (!user) return { liked: false, count: 0, needsAuth: true };

  const supabase = await createClient();
  const { data: deleted, error: delErr } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .select("post_id");
  if (delErr) console.error("unlike failed:", delErr.message);
  let liked = false;
  if (!deleted || deleted.length === 0) {
    const { error: insErr } = await supabase
      .from("post_likes")
      .upsert({ post_id: postId, user_id: user.id }, { onConflict: "post_id,user_id", ignoreDuplicates: true });
    if (insErr) console.error("like failed:", insErr.message);
    liked = true;
  }
  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  revalidatePath(`/blogs/${slug}`);
  return { liked, count: count ?? 0 };
}

export async function recordView(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const safeSlug = slug.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80);
  const cookieName = `viewed_${safeSlug}`;
  const store = await cookies();
  if (store.get(cookieName)) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_post_view", { p_slug: slug });
  if (!error) {
    store.set(cookieName, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6,
      path: "/",
    });
  }
}
