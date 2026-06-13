import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Role } from "@/lib/data/types";

export interface CurrentUser {
  id: string;
  email: string | null;
  displayName: string;
  role: Role;
}

/**
 * The signed-in user with their profile role, or null.
 * In sample-content mode (no Supabase) there is no auth, so this returns null
 * and the post pages render in "sample mode" (see the post detail page).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Reader",
    role: (profile?.role as Role) ?? "reader",
  };
}
