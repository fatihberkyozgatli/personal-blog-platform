"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const schema = z.object({ email: z.string().email("Please enter a valid email address.") });

export interface FormState {
  ok: boolean;
  message: string;
}

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, message: "Thank you for joining the journey." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email });

  if (error && error.code !== "23505") {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  return { ok: true, message: "Thank you for joining the journey." };
}
