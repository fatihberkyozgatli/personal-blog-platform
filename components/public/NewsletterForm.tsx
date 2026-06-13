"use client";

import { useActionState } from "react";
import { Button } from "@/components/shared/Button";
import { subscribe, type FormState } from "@/lib/actions/newsletter";

const initial: FormState = { ok: false, message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initial);

  return (
    <form action={formAction} className="w-full max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          aria-label="Your email address"
          placeholder="Your email address"
          className="w-full rounded-md border border-gold/30 bg-ivory px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? "Joining…" : "Sign Up"}
        </Button>
      </div>
      {state.message && (
        <p
          role="status"
          aria-live="polite"
          className={state.ok ? "mt-2 text-sm text-gold-400" : "mt-2 text-sm text-ivory/80"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
