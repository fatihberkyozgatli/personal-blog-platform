"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "../actions";
import { PasswordInput } from "../password-input";

const initialState: AuthState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  useEffect(() => {
    if (state.error) document.getElementById("email")?.focus();
  }, [state.error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ivory p-6">
      <div className="w-full max-w-md rounded-lg border border-gold/40 bg-parchment p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl text-maroon">Create Your Account</h1>
          <div aria-hidden className="mx-auto mt-3 h-2 w-2 rotate-45 bg-gold" />
          <p className="mt-3 text-ink-muted">Free, and it unlocks every reflection.</p>
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
            <PasswordInput autoComplete="new-password" invalid={!!state.error} helperText="At least 8 characters." />
            {state.error && (
              <p id="auth-error" role="alert" className="text-sm text-clay">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full cursor-pointer rounded bg-gold px-4 py-3 font-medium text-ink hover:bg-gold/90 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-maroon disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Creating..." : "Sign Up"}
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-ink-muted">
          Have an account?{" "}
          <Link href="/login" className="text-maroon underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
