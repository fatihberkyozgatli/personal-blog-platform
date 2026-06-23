import type { Metadata } from "next";
import { Instagram, Mail, MapPin, Youtube } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Floret, OrnamentRule } from "@/components/shared/Ornament";
import { ContactForm } from "@/components/public/ContactForm";
import { getContactSettings } from "@/lib/data/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a note.",
};

export default async function ContactPage() {
  const settings = await getContactSettings();
  const socialLinks = [
    settings.instagramUrl ? { href: settings.instagramUrl, label: "Instagram", icon: Instagram } : null,
    settings.youtubeUrl ? { href: settings.youtubeUrl, label: "YouTube", icon: Youtube } : null,
  ].filter(Boolean);

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Floret className="mx-auto mb-6 h-6 w-6" />
        <h1 className="font-display text-5xl text-ink">Get in Touch</h1>
        <div className="my-7">
          <OrnamentRule />
        </div>
        <p className="text-sm text-ink-muted">
          A thought to share, a question to ask, or simply a hello. I read every message.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-[1fr_1.4fr]">
        <aside className="space-y-5 text-sm text-ink-muted">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="font-medium text-ink">Email</p>
              <a href={`mailto:${settings.email}`} className="transition-colors hover:text-maroon">
                {settings.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="font-medium text-ink">Location</p>
              <p>{settings.location}</p>
            </div>
          </div>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 pt-1 text-ink-muted">
              {socialLinks.map((link) => {
                if (!link) return null;
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    className="transition-colors hover:text-maroon"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          )}
        </aside>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-6 shadow-card sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
