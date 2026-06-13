import type { Metadata } from "next";
import { LoginForm } from "@/components/public/AuthForms";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-center font-display text-3xl text-ink">Welcome back</h1>
      <p className="mb-6 text-center text-sm text-ink-muted">
        Sign in to continue reading.
      </p>
      <LoginForm redirectTo={redirect ?? "/"} />
    </>
  );
}
