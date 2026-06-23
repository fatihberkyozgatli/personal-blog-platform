"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils/cn";

export function MediaUploader({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const configured = isSupabaseConfigured();

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    const MAX_BYTES = 5 * 1024 * 1024;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("Unsupported file type. Use PNG, JPG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("That image is too large (5 MB max).");
      return;
    }
    setBusy(true);
    setStatus("Uploading…");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
      const safeBase =
        file.name
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || "image";
      const path = `${crypto.randomUUID()}-${safeBase}${ext ? `.${ext}` : ""}`;
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

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    await uploadFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function onDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!busy) setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragActive(false);
  }

  async function onDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragActive(false);
    if (busy) return;
    await uploadFile(e.dataTransfer.files?.[0]);
  }

  if (!configured) {
    return (
      <div className="rounded-xl2 border border-dashed border-gold/30 bg-parchment/50 p-8 text-center text-sm text-ink-muted">
        Connect Supabase Storage to upload images. Files go to the <code>media</code> bucket.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      disabled={busy}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl2 border border-dashed border-gold/40 bg-parchment p-8 text-center text-sm text-ink-muted transition-colors hover:border-gold hover:bg-gold/5 disabled:cursor-wait disabled:opacity-75",
        dragActive && "border-gold bg-gold/10 text-ink",
      )}
    >
      <UploadCloud className="h-7 w-7 text-gold" />
      <span className="font-medium text-ink">
        {busy ? "Uploading..." : dragActive ? "Drop image to upload" : "Upload an image"}
      </span>
      <span>Drag and drop, or click to choose. PNG, JPG, WebP, or GIF.</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={onFile}
        disabled={busy}
      />
      {status && <span className="text-xs" role="status">{status}</span>}
    </button>
  );
}
