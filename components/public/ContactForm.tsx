"use client";

import { useActionState } from "react";
import { Button } from "@/components/shared/Button";
import { sendMessage, type FormState } from "@/lib/actions/contact";

const initial: FormState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-md border border-gold/30 bg-parchment px-4 py-2.5 text-sm text-ink outline-none focus:border-gold";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendMessage, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            Name
          </label>
          <input id="name" name="name" required className={fieldClass} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
            autoComplete="email"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-ink">
          Subject <span className="text-ink-muted">(optional)</span>
        </label>
        <input id="subject" name="subject" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="body" className="mb-1 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea id="body" name="body" required rows={6} className={fieldClass} />
      </div>

      {state.message && (
        <p
          role="status"
          aria-live="polite"
          className={state.ok ? "text-sm text-emerald" : "text-sm text-clay"}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
