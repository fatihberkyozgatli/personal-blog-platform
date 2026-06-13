import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BackToTop } from "@/components/shared/BackToTop";
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-maroon focus:px-4 focus:py-2 focus:text-ivory"
      >
        Skip to content
      </a>
      <SiteHeader user={user ? { displayName: user.displayName, role: user.role } : null} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter categories={categories} />
      <BackToTop />
    </div>
  );
}
