"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "../actions";
import { PasswordInput } from "../password-input";
import { FormAlert } from "../form-alert";

const initialState: AuthState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <>
      <div className="text-center">
        <h1 className="font-display text-3xl text-ink">Choose a new password</h1>
        <p className="mt-3 text-sm text-ink-muted">Enter a new password for your account.</p>
      </div>
      <form action={formAction} className="mt-6 space-y-4">
        <PasswordInput autoComplete="new-password" invalid={!!state.error} helperText="At least 8 characters." />
        {state.error && <FormAlert message={state.error} />}
        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded bg-gold px-4 py-3 font-medium text-ink hover:bg-gold/90 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-maroon disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Update password"}
        </button>
      </form>
    </>
  );
}
