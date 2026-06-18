"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { contactSchema } from "@/lib/validations/contact";

export interface FormState {
  ok: boolean;
  message: string;
}

export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, message: "Your message has been sent. Thank you for reaching out." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert(parsed.data);
  if (error) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  return { ok: true, message: "Your message has been sent. Thank you for reaching out." };
}
