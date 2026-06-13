"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toggleLike } from "@/lib/actions/engagement";

export function LikeButton({
  postId,
  slug,
  initialCount,
  initialLiked,
}: {
  postId: string;
  slug: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await toggleLike(postId, slug);
      if (res.needsAuth) {
        router.push(`/login?redirect=/blogs/${slug}`);
        return;
      }
      setLiked(res.liked);
      setCount(res.count);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors cursor-pointer",
        liked
          ? "border-maroon bg-maroon/10 text-maroon"
          : "border-gold/40 text-ink-muted hover:border-gold hover:text-maroon",
      )}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-maroon")} />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
