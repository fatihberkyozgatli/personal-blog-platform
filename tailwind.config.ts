import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        ivory: "#F7EFDD",
        parchment: "#FBF6EA",
        maroon: {
          DEFAULT: "#6E1423",
          700: "#5A1019",
          800: "#4A0D14",
        },
        gold: {
          DEFAULT: "#C9A24B",
          400: "#D8B564",
          600: "#A8842F",

          700: "#7A5E1E",
        },
        persian: "#1F4E79",
        emerald: "#2E5E4E",
        clay: "#B5512F",
        ink: {
          DEFAULT: "#2B2018",
          muted: "#6B5D4F",
        },
      },
      fontFamily: {

        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 32, 24, 0.04), 0 8px 24px -12px rgba(43, 32, 24, 0.18)",
        panel: "0 24px 60px -28px rgba(74, 13, 20, 0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
