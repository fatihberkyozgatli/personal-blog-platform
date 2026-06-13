import { Cormorant_Garamond, Inter } from "next/font/google";

// Display / headings: an elegant, literary high-contrast serif (Ottoman/Persian editorial).
export const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body / UI: a clean, highly readable sans for long-form reading and controls.
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
