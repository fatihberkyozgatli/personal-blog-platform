"use client";

import { useActionState } from "react";
import { Button } from "@/components/shared/Button";
import type { ActionState } from "@/lib/actions/admin";

const initial: ActionState = { ok: false, message: "" };

export function AddItemForm({
  action,
  placeholder,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  placeholder: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          name="name"
          required
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-md border border-gold/30 bg-parchment px-4 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />
        {state.message && (
          <p
            role="status"
            aria-live="polite"
            className={state.ok ? "mt-1 text-sm text-emerald" : "mt-1 text-sm text-clay"}
          >
            {state.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add"}
      </Button>
    </form>
  );
}
