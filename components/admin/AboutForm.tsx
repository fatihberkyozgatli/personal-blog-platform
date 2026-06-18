"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Plus } from "lucide-react";
import { TiptapEditor } from "./TiptapEditor";
import { MediaUploader } from "./MediaUploader";
import { Button } from "@/components/shared/Button";
import { AboutView } from "@/components/public/AboutView";
import { updateAbout } from "@/lib/actions/about";
import type { ActionState } from "@/lib/actions/admin";
import type { AboutContent } from "@/lib/validations/about";

const initial: ActionState = { ok: false, message: "" };
const field =
  "w-full rounded-md border border-gold/30 bg-parchment px-4 py-2.5 text-base text-ink outline-none focus:border-gold sm:text-sm";

export function AboutForm({
  initial: about,
  initialHtml,
}: {
  initial: AboutContent;
  initialHtml: { intro: string; bio: string; why: string };
}) {
  const [state, action, pending] = useActionState(updateAbout, initial);
  const [name, setName] = useState(about.name);
  const [short, setShort] = useState(about.short);
  const [portraitUrl, setPortraitUrl] = useState(about.portraitUrl ?? "");
  const [quoteText, setQuoteText] = useState(about.favoriteQuote.text);
  const [quoteSource, setQuoteSource] = useState(about.favoriteQuote.source);
  const [timeline, setTimeline] = useState(() =>
    about.timeline.map((row) => ({ ...row, id: crypto.randomUUID() }))
  );

  const [intro, setIntro] = useState<unknown>(about.intro);
  const [bio, setBio] = useState<unknown>(about.bio);
  const [why, setWhy] = useState<unknown>(about.why);
  const [introHtml, setIntroHtml] = useState(initialHtml.intro);
  const [bioHtml, setBioHtml] = useState(initialHtml.bio);
  const [whyHtml, setWhyHtml] = useState(initialHtml.why);

  function setRow(i: number, key: "year" | "label", value: string) {
    setTimeline((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  }
  function addRow() {
    setTimeline((rows) => [...rows, { year: "", label: "", id: crypto.randomUUID() }]);
  }
  function removeRow(i: number) {
    setTimeline((rows) => rows.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setTimeline((rows) => {
      const next = [...rows];
      const j = i + dir;
      if (j < 0 || j >= next.length) return rows;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <form action={action} className="grid gap-8 xl:grid-cols-2">
      <div className="space-y-6">
        <input type="hidden" name="intro" value={JSON.stringify(intro ?? {})} />
        <input type="hidden" name="bio" value={JSON.stringify(bio ?? {})} />
        <input type="hidden" name="why" value={JSON.stringify(why ?? {})} />
        <input type="hidden" name="timeline" value={JSON.stringify(timeline.map(({ year, label }) => ({ year, label })))} />
        <input type="hidden" name="portraitUrl" value={portraitUrl} />

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <h2 className="mb-3 font-display text-lg text-ink">Author</h2>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">Name</label>
          <input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className={field} />

          <label htmlFor="short" className="mb-1 mt-4 block text-sm font-medium text-ink">
            Short bio <span className="text-ink-muted">(author card)</span>
          </label>
          <textarea id="short" name="short" rows={2} value={short} onChange={(e) => setShort(e.target.value)} className={field} />

          <label htmlFor="portraitUrlInput" className="mb-1 mt-4 block text-sm font-medium text-ink">Portrait</label>
          <input
            id="portraitUrlInput"
            value={portraitUrl}
            onChange={(e) => setPortraitUrl(e.target.value)}
            placeholder="Portrait image URL"
            className={field}
          />
          <div className="mt-3">
            <MediaUploader onUploaded={setPortraitUrl} />
          </div>
          {portraitUrl && (
            <button
              type="button"
              aria-label="Remove portrait image"
              onClick={() => setPortraitUrl("")}
              className="mt-2 text-xs text-clay underline"
            >
              Remove portrait
            </button>
          )}
        </div>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <label className="mb-1 block text-sm font-medium text-ink">Intro</label>
          <TiptapEditor
            ariaLabel="Intro"
            initialContent={about.intro}
            onChange={(json, html) => {
              setIntro(json);
              setIntroHtml(html);
            }}
          />
        </div>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <label className="mb-1 block text-sm font-medium text-ink">Bio</label>
          <TiptapEditor
            ariaLabel="Bio"
            initialContent={about.bio}
            onChange={(json, html) => {
              setBio(json);
              setBioHtml(html);
            }}
          />
        </div>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <label className="mb-1 block text-sm font-medium text-ink">Why I Write</label>
          <TiptapEditor
            ariaLabel="Why I Write"
            initialContent={about.why}
            onChange={(json, html) => {
              setWhy(json);
              setWhyHtml(html);
            }}
          />
        </div>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <h2 className="mb-3 font-display text-lg text-ink">Favourite Quote</h2>
          <label htmlFor="quoteText" className="mb-1 block text-sm font-medium text-ink">Quote</label>
          <textarea id="quoteText" name="quoteText" rows={2} value={quoteText} onChange={(e) => setQuoteText(e.target.value)} className={field} />
          <label htmlFor="quoteSource" className="mb-1 mt-4 block text-sm font-medium text-ink">Source</label>
          <input id="quoteSource" name="quoteSource" value={quoteSource} onChange={(e) => setQuoteSource(e.target.value)} className={field} />
        </div>

        <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Timeline</h2>
            <Button type="button" variant="ghost" onClick={addRow}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <ul className="space-y-3">
            {timeline.map((row, i) => (
              <li key={row.id} className="flex flex-wrap items-start gap-2">
                <input
                  aria-label={`Year ${i + 1}`}
                  value={row.year}
                  onChange={(e) => setRow(i, "year", e.target.value)}
                  placeholder="Year"
                  className={`${field} w-24`}
                />
                <input
                  aria-label={row.year ? `Label for ${row.year}` : `Label ${i + 1}`}
                  value={row.label}
                  onChange={(e) => setRow(i, "label", e.target.value)}
                  placeholder="What happened"
                  className={`${field} min-w-0 flex-1`}
                />
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" aria-label={`Move ${row.year || `entry ${i + 1}`} up`} onClick={() => move(i, -1)} className="grid h-11 w-11 place-items-center rounded-md text-ink-muted hover:bg-gold/10">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Move ${row.year || `entry ${i + 1}`} down`} onClick={() => move(i, 1)} className="grid h-11 w-11 place-items-center rounded-md text-ink-muted hover:bg-gold/10">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Remove ${row.year || `entry ${i + 1}`}`} onClick={() => removeRow(i)} className="grid h-11 w-11 place-items-center rounded-md text-clay hover:bg-clay/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {state.message && (
          <p className={state.ok ? "text-sm text-emerald" : "text-sm text-clay"}>{state.message}</p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving…" : "Save About Page"}
        </Button>
      </div>

      <div className="xl:sticky xl:top-24 xl:self-start">
        <div className="overflow-hidden rounded-xl2 border border-gold/25 bg-ivory shadow-card">
          <div className="border-b border-gold/20 bg-parchment px-4 py-3">
            <h2 className="font-display text-lg text-ink">Live Preview</h2>
            <p className="text-xs text-ink-muted">Updates as you edit, before saving.</p>
          </div>
          <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto">
            <AboutView
              name={name || "The Author"}
              portraitUrl={portraitUrl || null}
              introHtml={introHtml}
              bioHtml={bioHtml}
              whyHtml={whyHtml}
              favoriteQuote={{ text: quoteText, source: quoteSource }}
              timeline={timeline}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
