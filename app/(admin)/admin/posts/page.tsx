import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { ButtonLink } from "@/components/shared/Button";
import { listPosts } from "@/lib/data/admin";
import { deletePost } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils/format";

export default async function AdminPostsPage() {
  const posts = await listPosts();

  return (
    <>
      <PageHeader
        title="Posts"
        description="Write, edit, and publish reflections."
        action={
          <ButtonLink href="/admin/posts/new">
            <Plus className="h-4 w-4" /> New Post
          </ButtonLink>
        }
      />

      {posts.length === 0 ? (
        <EmptyState>No posts yet. Begin with your first reflection.</EmptyState>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-ivory/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/posts/${p.id}/edit`} className="font-medium text-ink hover:text-maroon">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{p.categoryName ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        p.status === "published"
                          ? "rounded-full bg-emerald/10 px-2 py-0.5 text-xs text-emerald"
                          : "rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold-600"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink-muted">
                    {p.viewCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{formatDate(p.updatedAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${p.id}/edit`}
                        aria-label={`Edit ${p.title}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-gold/10 hover:text-maroon"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          aria-label={`Delete ${p.title}`}
                          className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-clay/10 hover:text-clay cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
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
