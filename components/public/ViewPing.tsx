"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/lib/actions/engagement";

export function ViewPing({ slug }: { slug: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void recordView(slug);
  }, [slug]);
  return null;
}
