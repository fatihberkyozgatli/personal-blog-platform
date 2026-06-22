import Link from "next/link";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { ButtonLink } from "@/components/shared/Button";
import { listPosts } from "@/lib/data/admin";
import { deletePost, setFeaturedPost } from "@/lib/actions/admin";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { getFeaturedPostId } from "@/lib/data/posts";
import { formatDate } from "@/lib/utils/format";

export default async function AdminPostsPage() {
  const [posts, featuredId] = await Promise.all([listPosts(), getFeaturedPostId()]);

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
        <Card className="overflow-x-auto p-0">
          <table className="min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 text-center font-medium">Featured</th>
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
                          : "rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold-700"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink-muted">
                    {p.viewCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{formatDate(p.updatedAt)}</td>
                  <td className="px-5 py-3 text-center">
                    {p.status === "published" ? (
                      <form action={setFeaturedPost} className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          aria-label={p.id === featuredId ? `Featured — remove ${p.title} from homepage` : `Feature ${p.title} on homepage`}
                          aria-pressed={p.id === featuredId ? "true" : "false"}
                          className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-gold/10 hover:text-gold-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700"
                        >
                          <Star className={p.id === featuredId ? "h-4 w-4 fill-current text-gold-700" : "h-4 w-4"} />
                        </button>
                      </form>
                    ) : (
                      <span aria-hidden="true" className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${p.id}/edit`}
                        aria-label={`Edit ${p.title}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-gold/10 hover:text-maroon"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteForm
                        action={deletePost}
                        id={p.id}
                        label={`Delete ${p.title}`}
                        title="Delete this post?"
                        message={`"${p.title}" will be permanently deleted. This cannot be undone.`}
                        className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-clay/10 hover:text-clay cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </DeleteForm>
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
