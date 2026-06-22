export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading">
      <span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-maroon" />
    </div>
  );
}
