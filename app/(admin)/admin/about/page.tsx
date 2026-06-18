import { PageHeader } from "@/components/admin/ui";
import { AboutForm } from "@/components/admin/AboutForm";
import { getAboutContent } from "@/lib/data/about";
import { renderPostHtml } from "@/lib/tiptap/render";

export default async function AdminAboutPage() {
  const about = await getAboutContent();
  const initialHtml = {
    intro: renderPostHtml(about.intro),
    bio: renderPostHtml(about.bio),
    why: renderPostHtml(about.why),
  };
  return (
    <>
      <PageHeader title="About" description="Edit the About page and author details." />
      <AboutForm initial={about} initialHtml={initialHtml} />
    </>
  );
}
