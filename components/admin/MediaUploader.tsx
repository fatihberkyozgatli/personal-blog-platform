"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function MediaUploader({ onUploaded }: { onUploaded?: (url: string) => void } = {}) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Uploading…");
    try {
      const supabase = createClient();
      const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("media").insert({
        url: data.publicUrl,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
        uploaded_by: auth.user.id,
      });
      onUploaded?.(data.publicUrl);
      setStatus("Uploaded.");
      router.refresh();
    } catch {
      setStatus("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-xl2 border border-dashed border-gold/30 bg-parchment/50 p-8 text-center text-sm text-ink-muted">
        Connect Supabase Storage to upload images. Files go to the <code>media</code> bucket.
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl2 border border-dashed border-gold/40 bg-parchment p-8 text-center text-sm text-ink-muted transition-colors hover:border-gold hover:bg-gold/5">
      <UploadCloud className="h-7 w-7 text-gold" />
      <span className="font-medium text-ink">{busy ? "Uploading…" : "Upload an image"}</span>
      <span>PNG, JPG, or WebP. Stored in Supabase Storage.</span>
      <input type="file" accept="image/*" className="sr-only" onChange={onFile} disabled={busy} />
      {status && <span className="text-xs">{status}</span>}
    </label>
  );
}
