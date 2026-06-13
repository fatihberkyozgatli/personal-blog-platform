import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  // Middleware enforces admin access when Supabase is configured. In sample
  // mode there is no auth, so we show a clearly-labelled illustrative view.
  const name = user?.displayName ?? "Sample Admin";

  return (
    <div className="flex min-h-dvh bg-ivory">
      <AdminSidebar name={name} />
      <div className="flex-1 overflow-x-hidden">
        {!isSupabaseConfigured() && (
          <div className="border-b border-gold/30 bg-gold/10 px-8 py-2 text-center text-xs text-ink-muted">
            Sample mode — data is illustrative. Connect Supabase to manage real content.
          </div>
        )}
        <div className="px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
