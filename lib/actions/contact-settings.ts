"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";
import { contactSettingsSchema } from "@/lib/validations/contact-settings";
import type { ActionState } from "@/lib/actions/admin";
import type { Json } from "@/types/database";

export async function updateContactSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Connect Supabase (set NEXT_PUBLIC_SUPABASE_URL) to manage content." };
  }
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, message: "You are not authorized to do that." };

  const parsed = contactSettingsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    location: String(formData.get("location") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    youtubeUrl: String(formData.get("youtubeUrl") ?? ""),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert(
    { key: "contact", value: parsed.data as unknown as Json, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/contact");
  return { ok: true, message: "Contact settings updated." };
}
