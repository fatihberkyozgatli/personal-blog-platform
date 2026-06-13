"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { addComment, type CommentState } from "@/lib/actions/engagement";
import { formatDate } from "@/lib/utils/format";
import type { Comment } from "@/lib/data/types";

const initial: CommentState = { ok: false, message: "" };

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <li>
      <div className="rounded-lg border border-gold/15 bg-parchment p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-display text-lg text-ink">{comment.author.displayName}</span>
          <span className="text-xs text-ink-muted">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">{comment.body}</p>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <ul className="mt-3 space-y-3 border-l border-gold/20 pl-5">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CommentSection({
  postId,
  slug,
  comments,
  canComment,
}: {
  postId: string;
  slug: string;
  comments: Comment[];
  canComment: boolean;
}) {
  const [state, formAction, pending] = useActionState(addComment, initial);

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl text-ink">
        Conversation{comments.length > 0 && ` (${comments.length})`}
      </h2>

      {canComment ? (
        <form action={formAction} className="mt-5">
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="slug" value={slug} />
          <label htmlFor="body" className="sr-only">
            Your comment
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={4}
            placeholder="Share a thought…"
            className="w-full rounded-md border border-gold/30 bg-parchment px-4 py-3 text-sm text-ink outline-none focus:border-gold"
          />
          {state.message && (
            <p
              role="status"
              aria-live="polite"
              className={state.ok ? "mt-2 text-sm text-emerald" : "mt-2 text-sm text-clay"}
            >
              {state.message}
            </p>
          )}
          <div className="mt-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Posting…" : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-5 rounded-lg border border-gold/20 bg-parchment p-4 text-sm text-ink-muted">
          <Link href={`/login?redirect=/blogs/${slug}`} className="font-medium text-maroon underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {comments.length > 0 && (
        <ul className="mt-8 space-y-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </ul>
      )}
    </section>
  );
}
