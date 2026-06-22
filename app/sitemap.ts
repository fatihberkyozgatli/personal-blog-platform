import type { MetadataRoute } from "next";
import { getLatestPosts } from "@/lib/data/posts";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getLatestPosts(1000);
  const staticRoutes = ["", "/blogs", "/categories", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const postRoutes = posts.map((p) => ({
    url: `${SITE_URL}/blogs/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
  }));

  return [...staticRoutes, ...postRoutes];
}
