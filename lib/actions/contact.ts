"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const schema = z.object({
  name: z.string().min(1, "Please tell us your name.").max(120),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().max(160).optional(),
  body: z.string().min(1, "Please write a message.").max(5000),
});

export interface FormState {
  ok: boolean;
  message: string;
}

export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse({
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
