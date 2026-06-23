"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";
import { aboutSchema } from "@/lib/validations/about";
import type { ActionState } from "@/lib/actions/admin";
import type { Json } from "@/types/database";

export async function updateAbout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Connect Supabase (set NEXT_PUBLIC_SUPABASE_URL) to manage content." };
  }
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, message: "You are not authorized to do that." };

  let payload: unknown;
  try {
    const portrait = String(formData.get("portraitUrl") ?? "").trim();
    payload = {
      name: String(formData.get("name") ?? ""),
      short: String(formData.get("short") ?? ""),
      role: String(formData.get("role") ?? ""),
      location: String(formData.get("location") ?? ""),
      currentlyReading: String(formData.get("currentlyReading") ?? ""),
      currentlyWriting: String(formData.get("currentlyWriting") ?? ""),
      portraitUrl: portrait || null,
      intro: JSON.parse(String(formData.get("intro") ?? "{}")),
      bio: JSON.parse(String(formData.get("bio") ?? "{}")),
      why: JSON.parse(String(formData.get("why") ?? "{}")),
      favoriteQuote: {
        text: String(formData.get("quoteText") ?? ""),
        source: String(formData.get("quoteSource") ?? ""),
      },
      timeline: JSON.parse(String(formData.get("timeline") ?? "[]")),
    };
  } catch {
    return { ok: false, message: "The form could not be read. Please try again." };
  }

  const parsed = aboutSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert(
    { key: "about", value: parsed.data as unknown as Json, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, message: error.message };

  revalidatePath("/about");
  revalidatePath("/blogs/[slug]", "page");
  return { ok: true, message: "About page updated." };
}
