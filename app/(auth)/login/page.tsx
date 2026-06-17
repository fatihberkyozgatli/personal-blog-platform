"use client";

import { Suspense, useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, type AuthState } from "../actions";
import { PasswordInput } from "../password-input";
import { FormAlert } from "../form-alert";
import { useToast } from "@/components/shared/Toast";
import { safeNext } from "@/lib/utils/redirect";

const initialState: AuthState = {};

function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const next = safeNext(useSearchParams().get("next"));
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) document.getElementById("email")?.focus();
  }, [state.error]);

  useEffect(() => {
    if (state.ok) {
      toast("Welcome back — you're signed in.");
      router.push(next);
      router.refresh();
    }
  }, [state.ok, next, router, toast]);

  return (
    <>
      <div className="text-center">
        <h1 className="font-display text-3xl text-ink">Welcome back</h1>
        <p className="mt-3 text-sm text-ink-muted">Sign in to continue reading.</p>
      </div>
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
        <PasswordInput autoComplete="current-password" invalid={!!state.error} />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-maroon underline underline-offset-2 hover:text-maroon-700"
          >
            Forgot password?
          </Link>
        </div>
        {state.error && <FormAlert message={state.error} />}
        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded bg-gold px-4 py-3 font-medium text-ink hover:bg-gold/90 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-maroon disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-muted">
        No account yet?{" "}
        <Link href="/signup" className="text-maroon underline underline-offset-2">
          Sign up free
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="h-72 w-full rounded bg-parchment/60 motion-safe:animate-pulse" />}
    >
      <LoginForm />
    </Suspense>
  );
}
