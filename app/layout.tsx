import type { Metadata } from "next";
import { fontDisplay, fontSans } from "./fonts";
import { cn } from "@/lib/utils/cn";
import { ToastProvider } from "@/components/shared/Toast";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Thoughts. Stories. Reflections.`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "A space for personal reflections on life, faith, history, and everything in between.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
  },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(fontDisplay.variable, fontSans.variable)}>
      <body className="min-h-dvh overflow-x-hidden">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
