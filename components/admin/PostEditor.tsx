"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { Eye, X } from "lucide-react";
import { TiptapEditor } from "./TiptapEditor";
import { PostPreview } from "./PostPreview";
import { Button } from "@/components/shared/Button";
import { savePost, type ActionState } from "@/lib/actions/admin";
import { sanitizePreviewHtml } from "@/lib/tiptap/preview-sanitize";
import type { Category, PostStatus } from "@/lib/data/types";
import type { EditablePost } from "@/lib/data/admin";

const initial: ActionState = { ok: false, message: "" };
const field =
  "w-full rounded-md border border-gold/30 bg-parchment px-4 py-2.5 text-base text-ink outline-none focus:border-maroon sm:text-sm";
const layoutTransition: Transition = { type: "spring", stiffness: 230, damping: 32, mass: 0.9 };
const panelTransition: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.85 };
const instantTransition: Transition = { duration: 0 };

export function PostEditor({
  post,
  categories,
  initialHtml,
}: {
  post?: EditablePost;
  categories: Category[];
  initialHtml?: string;
}) {
  const [state, action, pending] = useActionState(savePost, initial);
  const [content, setContent] = useState<unknown>(post?.content ?? { type: "doc", content: [] });
  const [previewHtml, setPreviewHtml] = useState(() => sanitizePreviewHtml(initialHtml ?? ""));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSlotOpen, setPreviewSlotOpen] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const reduceMotion = useReducedMotion();
  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;

  function togglePreview() {
    if (previewOpen) {
      setPreviewOpen(false);
    } else {
      setPreviewSlotOpen(true);
      setPreviewOpen(true);
    }
  }

  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <motion.div
        layout
        transition={layoutTransition}
        className={`grid min-w-0 gap-6 ${previewSlotOpen ? "xl:grid-cols-2" : ""}`}
      >
        <motion.div
          layout
          animate={reduceMotion ? { x: 0, scale: 1 } : { x: previewOpen ? -14 : 0, scale: previewOpen ? 0.992 : 1 }}
          transition={reduceMotion ? instantTransition : layoutTransition}
          className="min-w-0 space-y-5"
          style={{ transformOrigin: "left center" }}
        >
          {post && <input type="hidden" name="id" value={post.id} />}
          <input type="hidden" name="content" value={JSON.stringify(content)} />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl text-ink">{post ? "Edit Post" : "New Post"}</p>
              <p className="text-xs text-ink-muted">Draft, compose, then preview before saving.</p>
            </div>
            <Button
              type="button"
              variant={previewOpen ? "secondary" : "ghost"}
              onClick={togglePreview}
              className="hidden shrink-0 xl:inline-flex"
            >
              {previewOpen ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewOpen ? "Close" : "Preview"}
            </Button>
          </div>

          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${field} font-display text-lg`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Body</label>
            <TiptapEditor
              initialContent={post?.content}
              ariaLabel="Post body"
              onChange={(json, html) => {
                setContent(json);
                setPreviewHtml(sanitizePreviewHtml(html));
              }}
            />
          </div>
        </motion.div>

        <AnimatePresence initial={false} onExitComplete={() => setPreviewSlotOpen(false)}>
          {previewOpen && (
            <motion.section
              key="post-preview"
              layout
              initial={reduceMotion ? false : { opacity: 0, x: 72, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 72, scale: 0.985 }}
              transition={reduceMotion ? instantTransition : panelTransition}
              className="hidden min-w-0 overflow-hidden xl:block xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto"
              style={{ transformOrigin: "right center" }}
            >
              <PostPreview
                title={title}
                excerpt={excerpt}
                coverImage={coverImage}
                category={selectedCategory}
                content={content}
                html={previewHtml}
                status={status}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>

      <aside className="space-y-5">
        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <h2 className="mb-3 font-display text-lg text-ink">Settings</h2>

          <label htmlFor="status" className="mb-1 block text-sm font-medium text-ink">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            className={field}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <label htmlFor="categoryId" className="mb-1 mt-4 block text-sm font-medium text-ink">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
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
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto from title"
            className={field}
          />
        </div>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-ink">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short teaser shown on cards and to non-members."
            className={field}
          />

          <label htmlFor="coverImage" className="mb-1 mt-4 block text-sm font-medium text-ink">
            Cover image URL <span className="text-ink-muted">(optional)</span>
          </label>
          <input
            id="coverImage"
            name="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Cover image URL"
            className={field}
          />
        </div>

        {state.message && (
          <p role="alert" className="text-sm text-clay">
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving…" : post ? "Update Post" : "Create Post"}
        </Button>
      </aside>
    </form>
  );
}
