import { Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { AddItemForm } from "@/components/admin/AddItemForm";
import { listTags } from "@/lib/data/admin";
import { createTag, deleteTag } from "@/lib/actions/admin";
import { DeleteForm } from "@/components/admin/DeleteForm";

export default async function AdminTagsPage() {
  const tags = await listTags();

  return (
    <>
      <PageHeader title="Tags" description="Finer labels for cross-cutting topics." />

      <Card className="mb-6">
        <AddItemForm action={createTag} placeholder="New tag name" />
      </Card>

      {tags.length === 0 ? (
        <EmptyState>No tags yet. Add one above.</EmptyState>
      ) : (
        <Card>
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-ivory px-3 py-1 text-sm text-ink"
              >
                {t.name}
                <DeleteForm
                  action={deleteTag}
                  id={t.id}
                  label={`Delete ${t.name}`}
                  title="Delete this tag?"
                  message={`"${t.name}" will be removed from all posts.`}
                  className="text-ink-muted hover:text-clay cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </DeleteForm>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
