import { Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { AddItemForm } from "@/components/admin/AddItemForm";
import { listTags } from "@/lib/data/admin";
import { createTag, deleteTag } from "@/lib/actions/admin";

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
                <form action={deleteTag}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    aria-label={`Delete ${t.name}`}
                    className="text-ink-muted hover:text-clay cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
