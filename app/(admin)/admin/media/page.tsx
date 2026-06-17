import { PageHeader, EmptyState } from "@/components/admin/ui";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { MediaCard } from "@/components/admin/MediaCard";
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
            <MediaCard key={m.id} id={m.id} url={m.url} filename={m.filename} />
          ))}
        </div>
      )}
    </>
  );
}
