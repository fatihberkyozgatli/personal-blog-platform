"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "../actions";
import { FormAlert } from "../form-alert";

const initialState: AuthState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  useEffect(() => {
    if (state.error) document.getElementById("email")?.focus();
  }, [state.error]);

  return (
    <>
      <div className="text-center">
        <h1 className="font-display text-3xl text-ink">Reset your password</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      {state.message ? (
        <p role="status" className="mt-6 rounded border border-emerald/40 bg-ivory p-4 text-center text-emerald">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email
              <span aria-hidden className="ml-0.5 text-clay">
                *
              </span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? "auth-error" : undefined}
              className="mt-1 w-full rounded border border-ink-muted/30 bg-ivory px-3 py-3 text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon"
            />
          </div>
          {state.error && <FormAlert message={state.error} />}
          <button
            type="submit"
            disabled={pending}
            className="w-full cursor-pointer rounded bg-gold px-4 py-3 font-medium text-ink hover:bg-gold/90 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-maroon disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-ink-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-maroon underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </>
  );
}
