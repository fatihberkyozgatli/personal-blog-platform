import { PageHeader } from "@/components/admin/ui";
import { PostEditor } from "@/components/admin/PostEditor";
import { listCategories } from "@/lib/data/admin";

export default async function NewPostPage() {
  const categories = await listCategories();
  return (
    <>
      <PageHeader title="New Post" description="Write a new reflection." />
      <PostEditor categories={categories} />
    </>
  );
}
