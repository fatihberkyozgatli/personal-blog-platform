import Image from "next/image";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { listMedia } from "@/lib/data/admin";

export default async function AdminMediaPage() {
  const media = await listMedia();

  return (
    <>
      <PageHeader title="Media" description="Images for cover photos and post bodies." />

      <div className="mb-8">
        <MediaUploader />
      </div>

      {media.length === 0 ? (
        <EmptyState>No media yet. Uploaded images will appear here with copyable URLs.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <figure key={m.id} className="overflow-hidden rounded-lg border border-gold/20 bg-parchment">
              <div className="relative aspect-[4/3]">
                <Image src={m.url} alt={m.filename} fill className="object-cover" sizes="240px" />
              </div>
              <figcaption className="truncate px-3 py-2 text-xs text-ink-muted" title={m.url}>
                {m.filename}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
