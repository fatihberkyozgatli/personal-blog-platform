"use client";

import { useState } from "react";

export function PasswordInput({
  autoComplete,
  invalid,
  helperText,
}: {
  autoComplete: string;
  invalid?: boolean;
  helperText?: string;
}) {
  const [show, setShow] = useState(false);
  const describedBy =
    [helperText ? "password-help" : null, invalid ? "auth-error" : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-ink">
        Password
        <span aria-hidden className="ml-0.5 text-clay">
          *
        </span>
      </label>
      <div className="relative mt-1">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="w-full rounded border border-ink-muted/30 bg-ivory px-3 py-3 pr-16 text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-sm text-maroon hover:underline"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {helperText && (
        <p id="password-help" className="mt-1 text-xs text-ink-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
