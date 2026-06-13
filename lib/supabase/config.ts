/**
 * Supabase is optional at build/preview time. When the env vars are absent the
 * app falls back to built-in sample content so the public site still renders.
 * Once NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are set, real data flows through.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
