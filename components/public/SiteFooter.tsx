import Link from "next/link";
import { Instagram, Mail, Twitter, Youtube } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Floret } from "@/components/shared/Ornament";
import { ManuscriptPanel } from "@/components/shared/ornaments";
import { PatternBg, FloralAccent } from "@/components/shared/ornament-kit";
import { NewsletterForm } from "./NewsletterForm";

const EXPLORE: [string, string][] = [
  ["Home", "/"],
  ["Blogs", "/blogs"],
  ["Categories", "/categories"],
];
const MORE: [string, string][] = [
  ["About", "/about"],
  ["Contact", "/contact"],
];

function FooterCol({ heading, links }: { heading: string; links: [string, string][] }) {
  return (
    <nav aria-label={heading}>
      <h3 className="mb-4 font-display text-lg text-gold-400">{heading}</h3>
      <ul className="space-y-2.5 text-sm text-ivory/75">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex items-center gap-2 transition-colors hover:text-gold"
            >
              <Floret className="h-2.5 w-2.5 text-gold/60" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20">
      {/* Join the Journey band */}
      <section className="relative overflow-hidden bg-maroon text-ivory">
        <FloralAccent className="pointer-events-none absolute -right-10 -top-8 h-44 w-44 opacity-50 sm:h-56 sm:w-56" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center">
          <div className="max-w-md">
            <h2 className="font-display text-3xl text-ivory">Join the Journey</h2>
            <p className="mt-2 text-sm text-ivory/75">
              Sign up to receive new posts, reflections, and updates.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* Footer */}
      <div className="relative overflow-hidden bg-maroon-800 text-ivory">
        <PatternBg opacity={0.06} size={320} />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <Logo tone="light" showTagline={false} />
            <p className="mt-4 text-sm text-ivory/70">
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

          {/* Navigation, pushed to the right */}
          <div className="flex items-start gap-12 sm:gap-16">
            <FooterCol heading="Explore" links={EXPLORE} />
            <FooterCol heading="More" links={MORE} />
            <ManuscriptPanel className="hidden h-28 w-36 opacity-80 lg:block" />
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
