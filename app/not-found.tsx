import { ButtonLink } from "@/components/shared/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl text-maroon" aria-hidden="true">404</p>
      <h1 className="mt-3 font-display text-2xl text-ink">This page wandered off.</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="secondary">
          Return home
        </ButtonLink>
        <ButtonLink href="/blogs">Browse posts</ButtonLink>
      </div>
    </div>
  );
}
