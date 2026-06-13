// Single source of brand + author details. Swap the placeholder name and add a
// real portrait URL once the client provides them.

export const site = {
  name: "Placeholder Name",
  tagline: "Thoughts. Stories. Reflections.",
  email: "hello@placeholder.com",
  social: { instagram: "@placeholder", location: "New York, USA" },
};

export const author = {
  name: "The Author",
  // Set to a Supabase Storage URL (or /public path) when available; null renders
  // an ornamental framed placeholder.
  portraitUrl: null as string | null,
  short: "Writer of quiet essays on faith, history, and the art of paying attention.",
  bio: "A reader and writer drawn to the spaces between things — the pause before a prayer, the dust of old empires, the page left open on a windowsill. These reflections are written slowly, and meant to be read the same way.",
  why: "I write to slow down. To notice the small mercies a busy day would otherwise spend without counting. Each essay is an attempt to hold one thought up to the light long enough to see it clearly — and to leave it somewhere a stranger might find it useful.",
  favoriteQuote: {
    text: "We write to taste life twice, in the moment and in retrospect.",
    source: "Anaïs Nin",
  },
  // Placeholder milestones — replace with the client's real story.
  timeline: [
    { year: "2016", label: "Filled the first notebook; kept the habit." },
    { year: "2019", label: "Began studying the history that shapes how we live." },
    { year: "2022", label: "Started sharing reflections with a small circle." },
    { year: "2024", label: "Opened this space to anyone who cares to read." },
  ],
};
