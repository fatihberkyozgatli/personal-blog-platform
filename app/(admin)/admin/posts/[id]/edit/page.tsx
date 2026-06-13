import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { PostEditor } from "@/components/admin/PostEditor";
import { getEditablePost, listCategories } from "@/lib/data/admin";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getEditablePost(id), listCategories()]);
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Edit Post" description={post.title} />
      <PostEditor post={post} categories={categories} />
    </>
  );
}
