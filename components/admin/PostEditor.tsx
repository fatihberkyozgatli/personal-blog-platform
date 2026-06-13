"use client";

import { useActionState, useState } from "react";
import { TiptapEditor } from "./TiptapEditor";
import { Button } from "@/components/shared/Button";
import { savePost, type ActionState } from "@/lib/actions/admin";
import type { Category } from "@/lib/data/types";
import type { EditablePost } from "@/lib/data/admin";

const initial: ActionState = { ok: false, message: "" };
const field =
  "w-full rounded-md border border-gold/30 bg-parchment px-4 py-2.5 text-sm text-ink outline-none focus:border-gold";

export function PostEditor({
  post,
  categories,
}: {
  post?: EditablePost;
  categories: Category[];
}) {
  const [state, action, pending] = useActionState(savePost, initial);
  const [content, setContent] = useState<unknown>(post?.content ?? null);

  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      {/* main column */}
      <div className="space-y-5">
        {post && <input type="hidden" name="id" value={post.id} />}
        <input type="hidden" name="content" value={JSON.stringify(content ?? {})} />

        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={post?.title}
            className={`${field} font-display text-lg`}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Body</label>
          <TiptapEditor initialContent={post?.content} onChange={setContent} />
        </div>
      </div>

      {/* sidebar */}
      <aside className="space-y-5">
        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <h2 className="mb-3 font-display text-lg text-ink">Settings</h2>

          <label htmlFor="status" className="mb-1 block text-sm font-medium text-ink">
            Status
          </label>
          <select id="status" name="status" defaultValue={post?.status ?? "draft"} className={field}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <label htmlFor="categoryId" className="mb-1 mt-4 block text-sm font-medium text-ink">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={post?.categoryId ?? ""}
            className={field}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label htmlFor="slug" className="mb-1 mt-4 block text-sm font-medium text-ink">
            Slug <span className="text-ink-muted">(optional)</span>
          </label>
          <input id="slug" name="slug" defaultValue={post?.slug} placeholder="auto from title" className={field} />
        </div>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-ink">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt}
            placeholder="A short teaser shown on cards and to non-members."
            className={field}
          />

          <label htmlFor="coverImage" className="mb-1 mt-4 block text-sm font-medium text-ink">
            Cover image URL <span className="text-ink-muted">(optional)</span>
          </label>
          <input
            id="coverImage"
            name="coverImage"
            defaultValue={post?.coverImage ?? ""}
            placeholder="https://…/storage/v1/object/…"
            className={field}
          />
        </div>

        {state.message && <p className="text-sm text-clay">{state.message}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving…" : post ? "Update Post" : "Create Post"}
        </Button>
      </aside>
    </form>
  );
}
