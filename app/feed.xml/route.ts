import { getPosts } from "@/lib/data/posts";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );
}

export async function GET() {
  const posts = await getPosts({ limit: 50 });
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${base}/blogs/${p.slug}</link>
      <guid>${base}/blogs/${p.slug}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      ${p.publishedAt ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : ""}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Placeholder Name</title>
    <link>${base}</link>
    <description>Thoughts. Stories. Reflections.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
