import { Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryIconEditor } from "@/components/admin/CategoryIconEditor";
import { listCategories } from "@/lib/data/admin";
import { deleteCategory } from "@/lib/actions/admin";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <>
      <PageHeader title="Categories" description="The themes posts are filed under." />

      <Card className="mb-6">
        <CategoryForm />
      </Card>

      {categories.length === 0 ? (
        <EmptyState>No categories yet.</EmptyState>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-gold/10">
            {categories.map((c) => {
              return (
              <li key={c.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <CategoryIconEditor id={c.id} slug={c.slug} icon={c.icon} />
                  <div>
                    <p className="font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-ink-muted">/{c.slug}</p>
                  </div>
                </div>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    aria-label={`Delete ${c.name}`}
                    className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-clay/10 hover:text-clay cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
