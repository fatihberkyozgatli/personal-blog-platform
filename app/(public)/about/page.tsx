import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { Floret, OrnamentRule } from "@/components/shared/Ornament";

export const metadata: Metadata = {
  title: "About",
  description: "About this space and the person behind it.",
};

export default function AboutPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Floret className="mx-auto mb-6 h-6 w-6" />
        <h1 className="font-display text-5xl text-ink">About</h1>
        <div className="my-7">
          <OrnamentRule />
        </div>
      </div>

      <div className="prose-editorial mx-auto max-w-2xl">
        <p>
          This is a space for slow thinking. For reflections on faith and doubt, the long shadow of
          history, the books that have shaped us, and the quiet work of becoming a little wiser than
          we were yesterday.
        </p>
        <p>
          The writing here is personal and unhurried. Some pieces are essays; others are closer to
          letters, or prayers, or notes left on a windowsill. What they share is an attempt to pay
          attention to the things that matter and last.
        </p>
        <h2>Why “Placeholder Name”</h2>
        <p>
          The name is not yet final. When it arrives, it will be the kind of name you can say
          quietly to yourself, the way you might name a garden or a season.
        </p>
        <blockquote>
          “We write to taste life twice, in the moment and in retrospect.”
        </blockquote>
        <p>
          Thank you for reading. If something here stays with you, that is the whole of the hope.
        </p>
      </div>
    </Container>
  );
}
