import { Quote } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Floret } from "@/components/shared/Ornament";
import { Portrait } from "@/components/shared/Portrait";
import { Divider, ArchFrame } from "@/components/shared/ornament-kit";
import { Reveal } from "@/components/shared/Motion";

export interface AboutViewProps {
  name: string;
  portraitUrl: string | null;
  introHtml: string;
  bioHtml: string;
  whyHtml: string;
  favoriteQuote: { text: string; source: string };
  timeline: { year: string; label: string }[];
}

export function AboutView({
  name,
  portraitUrl,
  introHtml,
  bioHtml,
  whyHtml,
  favoriteQuote,
  timeline,
}: AboutViewProps) {
  return (
    <section aria-labelledby="about-heading" className="relative overflow-hidden">
      <Container className="py-16">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Portrait src={portraitUrl} name={name} size={140} />
          <h1 id="about-heading" className="mt-6 font-display text-5xl text-ink">About</h1>
          <p className="mt-2 font-display text-xl text-maroon">{name}</p>
          <Divider className="my-7" />
        </Reveal>

        <Reveal delay={0.08} className="prose-editorial mx-auto max-w-2xl">
          <div dangerouslySetInnerHTML={{ __html: introHtml }} />
          <div dangerouslySetInnerHTML={{ __html: bioHtml }} />
        </Reveal>

        {favoriteQuote.text.trim() && (
          <Reveal delay={0.1} className="mx-auto my-16 max-w-3xl">
            <ArchFrame piece="arch-11-h.svg" tint="gold" className="px-14 py-16 text-center sm:px-28">
              <Quote className="mx-auto mb-3 h-6 w-6 text-gold-700" />
              <p className="mx-auto max-w-lg font-display text-xl italic leading-snug text-ink sm:text-2xl">
                &ldquo;{favoriteQuote.text}&rdquo;
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gold-700">
                {favoriteQuote.source}
              </p>
            </ArchFrame>
          </Reveal>
        )}

        <Reveal delay={0.05} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-ink">
            <span className="inline-flex items-center gap-3">
              <Floret /> Why I Write <Floret />
            </span>
          </h2>
          <div
            className="prose-editorial mx-auto mt-5 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: whyHtml }}
          />
        </Reveal>

        {timeline.length > 0 && (
          <Reveal delay={0.05} className="mx-auto mt-16 max-w-2xl">
            <h2 className="mb-8 text-center font-display text-3xl text-ink">
              A Few Marks Along the Way
            </h2>
            <ol className="relative border-l border-gold/40 pl-8">
              {timeline.map((t, i) => (
                <li key={`${t.year}-${i}`} className="relative mb-8 last:mb-0">
                  <span className="absolute -left-[39px] grid h-5 w-5 place-items-center rounded-full border border-gold/50 bg-ivory">
                    <Floret className="h-2.5 w-2.5" />
                  </span>
                  <p className="font-display text-2xl text-maroon">{t.year}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.label}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        )}

        <div className="mt-12 flex justify-center">
          <Floret className="h-5 w-5" />
        </div>
      </Container>
    </section>
  );
}
