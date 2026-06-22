import type { Metadata } from "next";
import { fontDisplay, fontSans } from "./fonts";
import { cn } from "@/lib/utils/cn";
import { ToastProvider } from "@/components/shared/Toast";
import { SITE_NAME } from "@/lib/site";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Thoughts. Stories. Reflections.`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "A space for personal reflections on life, faith, history, and everything in between.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }],
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
