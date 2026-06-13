import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, StatCard, Card } from "@/components/admin/ui";
import { getAdminStats, listPosts } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils/format";

export default async function AdminDashboard() {
  const [stats, posts] = await Promise.all([getAdminStats(), listPosts()]);
  const recent = posts.slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" description="A quiet overview of the garden." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Drafts" value={stats.drafts} />
        <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} />
        <StatCard label="Pending Comments" value={stats.pendingComments} />
        <StatCard label="Subscribers" value={stats.subscribers} />
        <StatCard label="Unread Messages" value={stats.unreadMessages} />
        <StatCard label="All Posts" value={stats.posts} />
      </div>

      <Card className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Recent Posts</h2>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1 text-sm font-medium text-maroon hover:text-gold-700"
          >
            All posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="divide-y divide-gold/10">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-3">
              <div>
                <Link href={`/admin/posts/${p.id}/edit`} className="font-medium text-ink hover:text-maroon">
                  {p.title}
                </Link>
                <p className="text-xs text-ink-muted">
                  {p.categoryName ?? "Uncategorized"} · {formatDate(p.publishedAt)}
                </p>
              </div>
              <span className="inline-flex items-center gap-3 text-xs text-ink-muted">
                <span className="tabular-nums">{p.viewCount.toLocaleString()} views</span>
                <span
                  className={
                    p.status === "published"
                      ? "rounded-full bg-emerald/10 px-2 py-0.5 text-emerald"
                      : "rounded-full bg-gold/15 px-2 py-0.5 text-gold-700"
                  }
                >
                  {p.status}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
