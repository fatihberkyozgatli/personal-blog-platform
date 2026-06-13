import {
  BookOpen,
  Compass,
  Feather,
  Flame,
  Globe,
  Heart,
  Landmark,
  Leaf,
  Moon,
  Mountain,
  PenTool,
  Quote,
  ScrollText,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  feather: Feather,
  flame: Flame,
  scroll: ScrollText,
  book: BookOpen,
  users: Users,
  sprout: Sprout,
  sparkles: Sparkles,
  moon: Moon,
  sun: Sun,
  star: Star,
  heart: Heart,
  compass: Compass,
  mountain: Mountain,
  leaf: Leaf,
  pen: PenTool,
  quote: Quote,
  landmark: Landmark,
  globe: Globe,
};

export const categoryIconNames = Object.keys(categoryIcons);

export const defaultIconBySlug: Record<string, string> = {
  reflections: "feather",
  faith: "flame",
  history: "scroll",
  literature: "book",
  society: "users",
  "personal-growth": "sprout",
};

export function getCategoryIcon(opts: { icon?: string | null; slug?: string }): LucideIcon {
  const key = opts.icon || (opts.slug ? defaultIconBySlug[opts.slug] : undefined);
  return (key && categoryIcons[key]) || Sparkles;
}
