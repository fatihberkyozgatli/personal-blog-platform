"use client";

import { Button } from "@/components/shared/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl text-maroon" aria-hidden="true">Oops</p>
      <h1 className="mt-3 font-display text-2xl text-ink">Something went wrong.</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        An unexpected error occurred. Please try again in a moment.
      </p>
      <div className="mt-6">
        <Button onClick={reset} variant="secondary">
          Try again
        </Button>
      </div>
    </div>
  );
}
