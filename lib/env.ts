import { z } from "zod";

const siteUrlSchema =
  process.env.NODE_ENV === "production" ? z.string().url() : z.string().url().optional();

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: siteUrlSchema,
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  throw new Error(
    "Invalid Supabase environment variables: " +
      JSON.stringify(parsed.error.flatten().fieldErrors),
  );
}

export const env = parsed.data;
