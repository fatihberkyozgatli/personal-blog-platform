import type { Metadata } from "next";
import { SignupForm } from "@/components/public/AuthForms";

export const metadata: Metadata = { title: "Create Account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-center font-display text-3xl text-ink">Join the Journey</h1>
      <p className="mb-6 text-center text-sm text-ink-muted">
        Create a free account to read every reflection.
      </p>
      <SignupForm redirectTo={redirect ?? "/"} />
    </>
  );
}
