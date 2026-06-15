import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7EFDD",
        parchment: "#FBF6EA",
        maroon: { DEFAULT: "#6E1423", 700: "#5A1019" },
        gold: "#C9A24B",
        persian: "#1F4E79",
        emerald: "#2E5E4E",
        clay: "#B5512F",
        ink: { DEFAULT: "#2B2018", muted: "#6B5D4F" },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
