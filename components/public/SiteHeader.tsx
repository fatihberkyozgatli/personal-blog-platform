"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ButtonLink, Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  user,
}: {
  user: { displayName: string; role: "admin" | "reader" } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/blogs?q=${encodeURIComponent(q)}`);
  }

  async function signOut() {
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/25 bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/75">
      {/* thin illuminated top border */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Logo showTagline className="[&_span:first-of-type]:text-xl sm:[&_span:first-of-type]:text-2xl" />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative py-1 text-sm font-medium text-ink transition-colors hover:text-maroon",
                isActive(item.href) && "text-maroon",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-gold" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-gold/10 cursor-pointer"
          >
            <Search className="h-5 w-5" />
          </button>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              {user.role === "admin" && (
                <ButtonLink href="/admin" variant="ghost">
                  Dashboard
                </ButtonLink>
              )}
              <Button variant="secondary" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <ButtonLink href="/signup" variant="secondary" className="hidden md:inline-flex">
              Sign Up
            </ButtonLink>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-gold/10 md:hidden cursor-pointer"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* search drawer */}
      {searchOpen && (
        <div className="border-t border-gold/20 bg-parchment">
          <form onSubmit={submitSearch} className="mx-auto flex w-full max-w-6xl gap-2 px-5 py-3 sm:px-8">
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search reflections, essays, histories…"
              className="w-full rounded-md border border-gold/30 bg-ivory px-4 py-2.5 text-sm text-ink outline-none focus:border-gold"
              aria-label="Search posts"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      )}

      {/* mobile menu */}
      {menuOpen && (
        <nav className="border-t border-gold/20 bg-parchment md:hidden" aria-label="Mobile">
          <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-2 sm:px-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "border-b border-gold/10 py-3 text-sm font-medium text-ink last:border-0",
                  isActive(item.href) && "text-maroon",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 py-3">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <ButtonLink href="/admin" variant="ghost" className="flex-1">
                      Dashboard
                    </ButtonLink>
                  )}
                  <Button variant="secondary" onClick={signOut} className="flex-1">
                    Sign Out
                  </Button>
                </>
              ) : (
                <ButtonLink href="/signup" variant="secondary" className="flex-1">
                  Sign Up
                </ButtonLink>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
