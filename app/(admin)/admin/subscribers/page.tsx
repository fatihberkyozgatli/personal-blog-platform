import { Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { listSubscribers } from "@/lib/data/admin";
import { deleteSubscriber } from "@/lib/actions/admin";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { formatDate } from "@/lib/utils/format";

export default async function AdminSubscribersPage() {
  const subscribers = await listSubscribers();

  return (
    <>
      <PageHeader
        title="Subscribers"
        description={`${subscribers.length} ${subscribers.length === 1 ? "person has" : "people have"} joined the journey.`}
      />

      {subscribers.length === 0 ? (
        <EmptyState>No subscribers yet. Newsletter sign-ups will appear here.</EmptyState>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-ivory/40">
                  <td className="px-5 py-3 text-ink">{s.email}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatDate(s.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <DeleteForm
                      action={deleteSubscriber}
                      id={s.id}
                      label={`Remove ${s.email}`}
                      title="Remove this subscriber?"
                      message={`${s.email} will be removed from the newsletter list.`}
                      className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-clay/10 hover:text-clay cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </DeleteForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
