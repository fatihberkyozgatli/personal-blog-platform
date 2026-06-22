import { Check, Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { listPendingComments } from "@/lib/data/admin";
import { approveComment, deleteComment } from "@/lib/actions/admin";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { formatDate } from "@/lib/utils/format";

export default async function AdminCommentsPage() {
  const pending = await listPendingComments();

  return (
    <>
      <PageHeader
        title="Comments"
        description="New comments wait here for approval before appearing publicly."
      />

      {pending.length === 0 ? (
        <EmptyState>Nothing to moderate. The queue is clear.</EmptyState>
      ) : (
        <div className="space-y-4">
          {pending.map((c) => (
            <Card key={c.id} className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-ink">{c.authorName}</span>
                  <span className="text-ink-muted">on “{c.postTitle}”</span>
                  <span className="text-xs text-ink-muted">· {formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">{c.body}</p>
              </div>
              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <form action={approveComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    aria-label="Approve comment"
                    className="inline-flex items-center gap-1 rounded-md bg-emerald/10 px-3 py-1.5 text-sm text-emerald hover:bg-emerald/20 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                </form>
                <DeleteForm
                  action={deleteComment}
                  id={c.id}
                  label="Delete comment"
                  title="Delete this comment?"
                  message="This comment will be permanently removed."
                  className="inline-flex items-center gap-1 rounded-md bg-clay/10 px-3 py-1.5 text-sm text-clay hover:bg-clay/20 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DeleteForm>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
