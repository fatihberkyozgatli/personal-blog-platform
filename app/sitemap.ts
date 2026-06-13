import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/data/posts";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const staticRoutes = ["", "/blogs", "/categories", "/about", "/contact"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const postRoutes = posts.map((p) => ({
    url: `${base}/blogs/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
  }));

  return [...staticRoutes, ...postRoutes];
}
