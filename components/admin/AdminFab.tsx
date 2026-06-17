"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

export function AdminFab() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="fixed bottom-8 left-8 z-40 hidden sm:block"
    >
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-maroon px-4 py-2.5 text-sm font-medium text-ivory shadow-panel transition-colors hover:bg-maroon-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <LayoutDashboard className="h-4 w-4 text-gold" />
        Admin Dashboard
      </Link>
    </motion.div>
  );
}
