import { MailOpen } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { listMessages } from "@/lib/data/admin";
import { markMessageRead } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils/format";

export default async function AdminMessagesPage() {
  const messages = await listMessages();

  return (
    <>
      <PageHeader title="Messages" description="Notes sent through the contact form." />

      {messages.length === 0 ? (
        <EmptyState>No messages yet. Contact submissions will appear here.</EmptyState>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <Card key={m.id} className={m.read ? "opacity-75" : ""}>
              <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="text-sm">
                  <span className="font-medium text-ink">{m.name}</span>{" "}
                  <a href={`mailto:${m.email}`} className="text-persian hover:underline">
                    {m.email}
                  </a>
                  {!m.read && (
                    <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold-700">
                      new
                    </span>
                  )}
                </div>
                <span className="text-xs text-ink-muted">{formatDate(m.createdAt)}</span>
              </div>
              {m.subject && <p className="text-sm font-medium text-ink">{m.subject}</p>}
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{m.body}</p>
              {!m.read && (
                <form action={markMessageRead} className="mt-3">
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-md border border-gold/40 px-3 py-1.5 text-sm text-ink-muted hover:border-gold hover:text-maroon cursor-pointer"
                  >
                    <MailOpen className="h-4 w-4" /> Mark as read
                  </button>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
