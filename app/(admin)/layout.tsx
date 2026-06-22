import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (isSupabaseConfigured()) {
    if (!user) redirect("/login?next=/admin");
    if (user.role !== "admin") redirect("/");
  }

  const name = user?.displayName ?? "Sample Admin";

  return (
    <div className="min-h-dvh bg-ivory lg:flex">
      <AdminSidebar name={name} />
      <div className="flex-1 overflow-x-hidden">
        {!isSupabaseConfigured() && (
          <div className="border-b border-gold/30 bg-gold/10 px-4 py-2 text-center text-xs text-ink-muted sm:px-6 lg:px-8">
            Sample mode — data is illustrative. Connect Supabase to manage real content.
          </div>
        )}
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
