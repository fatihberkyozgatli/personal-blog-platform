import { isSupabaseConfigured } from "@/lib/supabase/config";
import { aboutSchema, type AboutContent } from "@/lib/validations/about";
import type { Json } from "@/types/database";

function doc(...paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

export const defaultAbout: AboutContent = {
  name: "The Author",
  short: "Writer of quiet essays on faith, history, and the art of paying attention.",
  role: "writer / reader",
  location: "Istanbul / Dallas",
  currentlyReading: "The Museum of Innocence",
  currentlyWriting: "essay on memory",
  portraitUrl: null,
  intro: doc(
    "This is a space for slow thinking — reflections on faith and doubt, the long shadow of history, the books that have shaped us, and the quiet work of becoming a little wiser than we were yesterday.",
  ),
  bio: doc(
    "A reader and writer drawn to the spaces between things — the pause before a prayer, the dust of old empires, the page left open on a windowsill. These reflections are written slowly, and meant to be read the same way.",
  ),
  why: doc(
    "I write to slow down. To notice the small mercies a busy day would otherwise spend without counting. Each essay is an attempt to hold one thought up to the light long enough to see it clearly — and to leave it somewhere a stranger might find it useful.",
  ),
  favoriteQuote: {
    text: "We write to taste life twice, in the moment and in retrospect.",
    source: "Anaïs Nin",
  },
  timeline: [
    { year: "2016", label: "Filled the first notebook; kept the habit." },
    { year: "2019", label: "Began studying the history that shapes how we live." },
    { year: "2022", label: "Started sharing reflections with a small circle." },
    { year: "2024", label: "Opened this space to anyone who cares to read." },
  ],
};

export async function getAboutContent(): Promise<AboutContent> {
  if (!isSupabaseConfigured()) return defaultAbout;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "about")
    .maybeSingle();
  if (error) {
    console.error("getAboutContent failed:", error.message);
    return defaultAbout;
  }
  if (!data) return defaultAbout;
  const parsed = aboutSchema.safeParse(data.value as Json);
  if (!parsed.success) {
    console.error("getAboutContent: stored about content failed validation:", parsed.error.message);
    return defaultAbout;
  }
  return parsed.data;
}
