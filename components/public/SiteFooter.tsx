import Link from "next/link";
import { Instagram, Mail, MapPin, Twitter, Youtube } from "lucide-react";
import type { Category } from "@/lib/data/types";
import { Logo } from "@/components/shared/Logo";
import { Floret } from "@/components/shared/Ornament";
import { PerchedBird, ManuscriptPanel } from "@/components/shared/ornaments";
import { NewsletterForm } from "./NewsletterForm";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-20">
      {/* Join the Journey band */}
      <section className="relative overflow-hidden bg-maroon text-ivory">
        <PerchedBird className="pointer-events-none absolute right-6 top-4 h-10 w-12 opacity-80" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center">
          <div className="max-w-md">
            <h2 className="font-display text-3xl text-ivory">Join the Journey</h2>
            <p className="mt-2 text-sm text-ivory/75">
              Sign up to receive new posts, reflections, and updates.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* Footer columns */}
      <div className="bg-maroon-800 text-ivory">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo tone="light" showTagline={false} />
            <p className="mt-4 max-w-xs text-sm text-ivory/70">
              Personal thoughts, reflections, and writings inspired by faith, history, culture,
              and life.
            </p>
            <div className="mt-5 flex gap-3 text-ivory/70">
              <a href="#" aria-label="Instagram" className="transition-colors hover:text-gold">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="transition-colors hover:text-gold">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube" className="transition-colors hover:text-gold">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Email" className="transition-colors hover:text-gold">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <nav aria-label="Navigate">
            <h3 className="font-display text-lg text-gold-400">Navigate</h3>
            <ul className="mt-4 space-y-2 text-sm text-ivory/75">
              {[
                ["Home", "/"],
                ["Blogs", "/blogs"],
                ["Categories", "/categories"],
                ["About", "/about"],
                ["Contact", "/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-gold">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Categories">
            <h3 className="font-display text-lg text-gold-400">Categories</h3>
            <ul className="mt-4 space-y-2 text-sm text-ivory/75">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/categories?c=${c.slug}`} className="transition-colors hover:text-gold">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-lg text-gold-400">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-ivory/75">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold/80" /> hello@placeholder.com
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-gold/80" /> @placeholder
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold/80" /> New York, USA
              </li>
            </ul>
            <ManuscriptPanel className="mt-5 h-24 w-32 opacity-80" />
          </div>
        </div>

        <div className="border-t border-ivory/10">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-5 py-5 text-xs text-ivory/60 sm:px-8">
            <Floret className="h-3 w-3 text-gold/70" />
            <span>© {new Date().getFullYear()} Placeholder Name. All rights reserved.</span>
            <Floret className="h-3 w-3 text-gold/70" />
          </div>
        </div>
      </div>
    </footer>
  );
}
