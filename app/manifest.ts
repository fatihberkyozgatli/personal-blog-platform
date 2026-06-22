import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Red Diary",
    description: "A personal reflections blog: thoughts on faith, history, literature, and life.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7EFDD",
    theme_color: "#6E1423",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
