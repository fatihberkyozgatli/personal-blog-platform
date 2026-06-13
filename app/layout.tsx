import type { Metadata } from "next";
import { fontDisplay, fontSans } from "./fonts";
import { cn } from "@/lib/utils/cn";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Placeholder Name — Thoughts. Stories. Reflections.",
    template: "%s — Placeholder Name",
  },
  description:
    "A space for personal reflections on life, faith, history, and everything in between.",
  openGraph: {
    type: "website",
    siteName: "Placeholder Name",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(fontDisplay.variable, fontSans.variable)}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
