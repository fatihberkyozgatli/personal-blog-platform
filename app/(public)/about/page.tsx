import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { Floret, OrnamentRule } from "@/components/shared/Ornament";
import { Portrait } from "@/components/shared/Portrait";
import { Reveal } from "@/components/shared/Motion";
import { author } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About this space and the person behind it.",
};

export default function AboutPage() {
  return (
    <Container className="py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Portrait src={author.portraitUrl} name={author.name} size={132} />
        <h1 className="mt-6 font-display text-5xl text-ink">About</h1>
        <p className="mt-2 font-display text-xl text-maroon">{author.name}</p>
        <div className="my-7">
          <OrnamentRule />
        </div>
      </Reveal>

      <Reveal delay={0.1} className="prose-editorial mx-auto max-w-2xl">
        <p>
          This is a space for slow thinking. For reflections on faith and doubt, the long shadow of
          history, the books that have shaped us, and the quiet work of becoming a little wiser than
          we were yesterday.
        </p>
        <p>{author.bio}</p>
        <h2>Why “Placeholder Name”</h2>
        <p>
          The name is not yet final. When it arrives, it will be the kind of name you can say
          quietly to yourself, the way you might name a garden or a season.
        </p>
        <blockquote>“We write to taste life twice, in the moment and in retrospect.”</blockquote>
        <p>
          Thank you for reading. If something here stays with you, that is the whole of the hope.
        </p>
      </Reveal>

      <div className="mt-10 flex justify-center">
        <Floret className="h-5 w-5" />
      </div>
    </Container>
  );
}
