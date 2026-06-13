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
};
