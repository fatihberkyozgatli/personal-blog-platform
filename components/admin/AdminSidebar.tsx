"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Eye,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Tags,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Floret } from "@/components/shared/Ornament";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useToast } from "@/components/shared/Toast";
import { lockBodyScroll } from "@/lib/utils/scroll-lock";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/about", label: "About", icon: UserRound },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const unlock = lockBodyScroll();
    const trigger = triggerRef.current;
    closeBtnRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
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
  }, [mobileOpen]);

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function signOut() {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    toast("You've been signed out.");
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
      {items.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            active(href, exact)
              ? "bg-gold/15 text-gold-400"
              : "text-ivory/75 hover:bg-ivory/5 hover:text-ivory",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-ivory/10 px-3 py-4">
      <p className="px-3 pb-2 text-xs text-ivory/50">Signed in as {name}</p>
      <Link
        href="/"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ivory/75 hover:bg-ivory/5 hover:text-ivory"
      >
        <Eye className="h-4 w-4" />
        User View
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ivory/75 hover:bg-ivory/5 hover:text-ivory cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gold/20 bg-maroon-800 px-4 py-3 text-ivory lg:hidden">
        <div className="flex items-center gap-2">
          <Floret className="h-5 w-5 text-gold" />
          <span className="font-display text-xl text-ivory">Admin</span>
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin navigation"
          aria-expanded={mobileOpen}
          className="grid h-10 w-10 place-items-center rounded-md text-ivory/85 transition-colors hover:bg-ivory/10 hover:text-ivory cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-ink/45 cursor-default"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="relative flex h-full w-72 max-w-[85vw] flex-col bg-maroon-800 text-ivory shadow-panel"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2">
                <Floret className="h-5 w-5 text-gold" />
                <span className="font-display text-xl text-ivory">Admin</span>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin navigation"
                className="grid h-9 w-9 place-items-center rounded-md text-ivory/75 transition-colors hover:bg-ivory/10 hover:text-ivory cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      <aside className="hidden w-60 shrink-0 flex-col bg-maroon-800 text-ivory lg:flex lg:sticky lg:top-0 lg:h-dvh lg:self-start lg:overflow-y-auto">
        <div className="flex items-center gap-2 px-5 py-5">
          <Floret className="h-5 w-5 text-gold" />
          <span className="font-display text-xl text-ivory">Admin</span>
        </div>

        {nav}
        {footer}
      </aside>
    </>
  );
}
