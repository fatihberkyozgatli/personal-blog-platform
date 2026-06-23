import { isSupabaseConfigured } from "@/lib/supabase/config";
import { contactSettingsSchema, type ContactSettings } from "@/lib/validations/contact-settings";
import type { Json } from "@/types/database";

export const defaultContactSettings: ContactSettings = {
  email: "hello@placeholder.com",
  location: "New York, USA",
  instagramUrl: null,
  youtubeUrl: null,
};

export async function getContactSettings(): Promise<ContactSettings> {
  if (!isSupabaseConfigured()) return defaultContactSettings;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "contact")
    .maybeSingle();
  if (error) {
    console.error("getContactSettings failed:", error.message);
    return defaultContactSettings;
  }
  if (!data) return defaultContactSettings;
  const parsed = contactSettingsSchema.safeParse(data.value as Json);
  if (!parsed.success) {
    console.error("getContactSettings: stored contact settings failed validation:", parsed.error.message);
    return defaultContactSettings;
  }
  return parsed.data;
}
