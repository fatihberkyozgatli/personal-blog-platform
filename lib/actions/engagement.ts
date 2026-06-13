"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";

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
    user_id: user.id, // RLS also enforces user_id = auth.uid()
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
  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) console.error("unlike failed:", error.message);
  } else {
    const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    if (error) console.error("like failed:", error.message);
  }

  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  revalidatePath(`/blogs/${slug}`);
  return { liked: !existing, count: count ?? 0 };
}

/**
 * Records a single post view. Called once per page load from the client (see
 * ViewPing), so it never blocks render and isn't re-counted on prefetch.
 */
export async function recordView(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.rpc("increment_post_view", { p_slug: slug });
}
