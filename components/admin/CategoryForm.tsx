"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/shared/Button";
import { createCategory, type ActionState } from "@/lib/actions/admin";
import { categoryIcons, categoryIconNames } from "@/lib/category-icons";
import { cn } from "@/lib/utils/cn";

const initial: ActionState = { ok: false, message: "" };

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initial);
  const [icon, setIcon] = useState("feather");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="icon" value={icon} />

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
          Category name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="e.g. Poetry"
          className="w-full rounded-md border border-gold/30 bg-parchment px-4 py-2.5 text-base text-ink outline-none focus:border-maroon sm:text-sm"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-ink">Icon</span>
        <div className="flex flex-wrap gap-2">
          {categoryIconNames.map((name) => {
            const Icon = categoryIcons[name];
            const active = name === icon;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setIcon(name)}
                aria-label={name}
                aria-pressed={active}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-md border transition-colors cursor-pointer",
                  active
                    ? "border-maroon bg-maroon/10 text-maroon"
                    : "border-gold/30 text-ink-muted hover:border-gold hover:text-maroon",
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          aria-live={state.ok ? "polite" : "assertive"}
          className={state.ok ? "text-sm text-emerald" : "text-sm text-clay"}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add Category"}
      </Button>
    </form>
  );
}
