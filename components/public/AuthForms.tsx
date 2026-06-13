"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";

const initial: AuthState = { ok: false, message: "" };
const field =
  "w-full rounded-md border border-gold/30 bg-ivory px-4 py-2.5 text-sm text-ink outline-none focus:border-gold";

function Notice({ state }: { state: AuthState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={state.ok ? "text-sm text-emerald" : "text-sm text-clay"}
    >
      {state.message}
    </p>
  );
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={field}
        />
      </div>
      <Notice state={state} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-maroon hover:text-gold-600">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(signUp, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-ink">
          Name
        </label>
        <input id="displayName" name="displayName" required autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className={field}
        />
        <p className="mt-1 text-xs text-ink-muted">At least 8 characters.</p>
      </div>
      <Notice state={state} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create Account"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-maroon hover:text-gold-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
