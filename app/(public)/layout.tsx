import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { getCategories } from "@/lib/data/posts";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user ? { displayName: user.displayName, role: user.role } : null} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} />
    </div>
  );
}
