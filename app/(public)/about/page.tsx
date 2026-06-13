import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Floret } from "@/components/shared/Ornament";
import { Portrait } from "@/components/shared/Portrait";
import { Divider, PatternBg, ArchFrame } from "@/components/shared/ornament-kit";
import { Reveal } from "@/components/shared/Motion";
import { author } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About this space and the person behind it.",
};

export default function AboutPage() {
  return (
    <section className="relative overflow-hidden">
      <PatternBg opacity={0.05} />
      <Container className="py-16">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Portrait src={author.portraitUrl} name={author.name} size={140} />
          <h1 className="mt-6 font-display text-5xl text-ink">About</h1>
          <p className="mt-2 font-display text-xl text-maroon">{author.name}</p>
          <Divider className="my-7" />
        </Reveal>

        <Reveal delay={0.08} className="prose-editorial mx-auto max-w-2xl">
          <p>
            This is a space for slow thinking — reflections on faith and doubt, the long shadow of
            history, the books that have shaped us, and the quiet work of becoming a little wiser
            than we were yesterday.
          </p>
          <p>{author.bio}</p>
        </Reveal>

        {/* Favorite quote, in a Persian arch frame */}
        <Reveal delay={0.1} className="mx-auto my-14 max-w-xl">
          <ArchFrame piece="arch-11.svg" tint="gold" className="px-10 py-14 text-center">
            <Quote className="mx-auto mb-3 h-7 w-7 text-gold" />
            <p className="font-display text-2xl italic leading-snug text-ink">
              “{author.favoriteQuote.text}”
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-gold-700">
              {author.favoriteQuote.source}
            </p>
          </ArchFrame>
        </Reveal>

        {/* Why I write */}
        <Reveal delay={0.05} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-ink">
            <span className="inline-flex items-center gap-3">
              <Floret /> Why I Write <Floret />
            </span>
          </h2>
          <p className="prose-editorial mx-auto mt-5 max-w-2xl">{author.why}</p>
        </Reveal>

        {/* Timeline */}
        <Reveal delay={0.05} className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-8 text-center font-display text-3xl text-ink">A Few Marks Along the Way</h2>
          <ol className="relative border-l border-gold/40 pl-8">
            {author.timeline.map((t) => (
              <li key={t.year} className="relative mb-8 last:mb-0">
                <span className="absolute -left-[39px] grid h-5 w-5 place-items-center rounded-full border border-gold/50 bg-ivory">
                  <Floret className="h-2.5 w-2.5" />
                </span>
                <p className="font-display text-2xl text-maroon">{t.year}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.label}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="mt-12 flex justify-center">
          <Floret className="h-5 w-5" />
        </div>
      </Container>
    </section>
  );
}
