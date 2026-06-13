"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/lib/actions/engagement";

/** Fires a single view count per page load (non-blocking, no prefetch double-count). */
export function ViewPing({ slug }: { slug: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void recordView(slug);
  }, [slug]);
  return null;
}
