import { AlertCircle } from "lucide-react";

export function FormAlert({ message }: { message: string }) {
  return (
    <p
      id="auth-error"
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-clay/40 bg-clay/10 px-3.5 py-3 text-sm text-clay"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
