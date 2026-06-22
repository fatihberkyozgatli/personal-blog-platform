const MIN_SUBMIT_MS = 1200;

export function isLikelyBot(formData: FormData): boolean {
  if (formData.get("company")) return true;

  const startedAt = Number(formData.get("startedAt"));
  if (!Number.isFinite(startedAt)) return false;

  return Date.now() - startedAt < MIN_SUBMIT_MS;
}
