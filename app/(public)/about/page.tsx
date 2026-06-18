import type { Metadata } from "next";
import { AboutView } from "@/components/public/AboutView";
import { getAboutContent } from "@/lib/data/about";
import { renderPostHtml } from "@/lib/tiptap/render";

export const metadata: Metadata = {
  title: "About",
  description: "About this space and the person behind it.",
};

export default async function AboutPage() {
  const about = await getAboutContent();
  return (
    <AboutView
      name={about.name}
      portraitUrl={about.portraitUrl}
      introHtml={renderPostHtml(about.intro)}
      bioHtml={renderPostHtml(about.bio)}
      whyHtml={renderPostHtml(about.why)}
      favoriteQuote={about.favoriteQuote}
      timeline={about.timeline}
    />
  );
}
