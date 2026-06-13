"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Floret } from "@/components/shared/Ornament";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText },
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

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function signOut() {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    router.push("/");
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-maroon-800 text-ivory">
      <div className="flex items-center gap-2 px-5 py-5">
        <Floret className="h-5 w-5 text-gold" />
        <span className="font-display text-xl text-ivory">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
        {items.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
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

      <div className="border-t border-ivory/10 px-3 py-4">
        <p className="px-3 pb-2 text-xs text-ivory/50">Signed in as {name}</p>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ivory/75 hover:bg-ivory/5 hover:text-ivory"
        >
          View site
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
    </aside>
  );
}
