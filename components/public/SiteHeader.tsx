"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ButtonLink, Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useToast } from "@/components/shared/Toast";
import { lockBodyScroll } from "@/lib/utils/scroll-lock";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/categories", label: "Categories" },
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
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const menuRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const unlock = lockBodyScroll();
    const trigger = menuTriggerRef.current;
    menuRef.current?.querySelector<HTMLElement>("a[href], button")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      trigger?.focus();
    };
  }, [menuOpen]);

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
    toast("You've been signed out.");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/25 bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/75">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-8 sm:py-3">
        <Logo
          showTagline
          className="max-w-[13rem] shrink-0 gap-2 [&_svg]:h-8 [&_svg]:w-8 [&_span:first-of-type]:text-lg [&_span:last-child]:mt-0.5 [&_span:last-child]:text-[0.5rem] [&_span:last-child]:tracking-[0.08em] min-[380px]:max-w-none min-[380px]:[&_span:last-child]:text-[0.56rem] sm:gap-3 sm:[&_svg]:h-9 sm:[&_svg]:w-9 sm:[&_span:first-of-type]:text-2xl sm:[&_span:last-child]:mt-1 sm:[&_span:last-child]:text-[0.7rem] sm:[&_span:last-child]:tracking-[0.22em]"
        />

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
          <AnimatePresence initial={false}>
            {searchOpen && (
              <motion.form
                key="desktop-search"
                id="site-search-desktop"
                role="search"
                onSubmit={submitSearch}
                initial={reduceMotion ? false : { width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { width: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="hidden overflow-hidden md:flex"
              >
                <input
                  autoFocus
                  type="search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search posts..."
                  className="w-60 rounded-md border border-gold/30 bg-parchment px-3 py-2 text-base text-ink outline-none focus:border-maroon sm:text-sm"
                  aria-label="Search posts"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="site-search-desktop"
            className="hidden h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-gold/10 md:grid cursor-pointer"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <Button variant="secondary" onClick={signOut} className="shrink-0 whitespace-nowrap">
                Sign Out
              </Button>
            </div>
          ) : (
            <ButtonLink
              href="/signup"
              variant="secondary"
              className="hidden shrink-0 whitespace-nowrap md:inline-flex"
            >
              Sign Up
            </ButtonLink>
          )}

          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="site-search-mobile"
            className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-gold/10 md:hidden cursor-pointer"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <button
            ref={menuTriggerRef}
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setSearchOpen(false);
            }}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-gold/10 md:hidden cursor-pointer"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form
          id="site-search-mobile"
          role="search"
          onSubmit={submitSearch}
          className="border-t border-gold/20 bg-parchment px-4 py-3 md:hidden"
        >
          <input
            autoFocus
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search posts..."
            aria-label="Search posts"
            className="w-full rounded-md border border-gold/30 bg-ivory px-3 py-2.5 text-base text-ink outline-none focus:border-maroon"
          />
        </form>
      )}

      {menuOpen && (
        <nav
          ref={menuRef}
          id="site-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="border-t border-gold/20 bg-parchment md:hidden"
        >
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
            <div className="flex flex-col gap-2 py-3">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/40 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-gold hover:bg-gold/10"
                >
                  <LayoutDashboard className="h-4 w-4 text-maroon" />
                  Admin Dashboard
                </Link>
              )}
              {user ? (
                <Button variant="secondary" onClick={signOut} className="w-full">
                  Sign Out
                </Button>
              ) : (
                <ButtonLink href="/signup" variant="secondary" className="w-full">
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
