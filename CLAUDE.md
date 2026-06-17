# Placeholder Name: Claude Guide

Personal reflections blog (Ottoman/Persian editorial aesthetic). Public pages are open to all;
**reading a full post body requires a free account** (registration wall). Owner manages content
via a built-in admin portal.

**Naming:** the brand name is not finalized. Use "Placeholder Name" wherever a name is needed;
do not invent or write a real name until the client provides one.

Full design docs: `documentation/architecture.md`, `documentation/database.md`,
`documentation/design.md`, `documentation/stages.md` (plus `wireframes.png`). Per-stage build specs
live in `documentation/stageN.md` (`stage1.md`, `stage2.md`). Read these before non-trivial work.

## Stack

- **Next.js 15** App Router + **TypeScript**, **Tailwind** (custom theme), **Supabase**
  (Postgres/Auth/Storage), **Tiptap** (content as JSON), **Vercel**.

## Architecture rules (do not violate)

- **Server Components by default.** Add `"use client"` only for genuinely interactive pieces
  (auth forms, search, comment composer, Tiptap editor, admin forms).
- **Mutations = Server Actions** + the Supabase server client. No bespoke REST routes. Validate
  inputs with Zod (`lib/validations/`).
- **Security is in the database (RLS), not the UI.** Never gate content only on the frontend.
  - The post **body (`posts.content`) is gated**: anonymous/public reads go through the
    `posts_public` view (safe columns only, no `content`); the full row is selectable only by
    authenticated users. At the DB level, anon also has only safe-column grants on published
    posts and never `posts.content`. Keep it that way; do not expose `content` to anon code paths.
- **Supabase clients:** `lib/supabase/client.ts` (browser), `server.ts` (RSC + actions),
  `middleware.ts` (session refresh). **Never** put the service-role key in client-reachable code;
  v1 does not need it at all.
- **Tiptap extension parity:** the editor and the read-only renderer (`generateHTML`) MUST use the
  *same* extension set. Keep it in one shared module (`lib/tiptap/`). Mismatched extensions
  render content differently than authored.
- **No `scheduled` status.** Future-dated `published_at` + `status='published'` = scheduled.
  Public queries filter `status='published' AND published_at <= now()`.

## Routing

- Route groups: `(public)`, `(auth)`, `(admin)`. `middleware.ts` refreshes the session and guards
  `/admin/*` (must be `role='admin'`). The reading wall is enforced per-page (server-side) + RLS.

## Conventions

- TypeScript strict. Generated DB types live in `types/database.ts`
  (`supabase gen types typescript`). Migrations in `supabase/migrations/`.
- Theme tokens (ivory, parchment, maroon, gold, persian, emerald, ink) in `tailwind.config.ts`,
  see `design.md`. Headings: Playfair Display; body: Inter (via `next/font`).
- Decorative ornament is `aria-hidden`; never required for meaning.

## Rules

- Do not add any comments
- Remove any unused file/code when you find one if it is safe to do so!

## Per-stage review gate (before committing)

Before committing **any** stage, run **three review agents in parallel** over that stage's changes,
then present one combined, compared report:

1. `/code-review` — correctness bugs + reuse/simplification/efficiency.
2. `/security-review` — security of the pending changes.
3. `/ui-ux-pro-max:ui-ux-pro-max` — UI/UX review (use the UI/UX skill best suited to the stage;
   this is the one installed).

Compare and report all findings (overlapping vs unique, grouped by severity). Then **wait for the
user's explicit command** on what to do about the findings before changing anything or committing.

## Git commits

- Do NOT add a `Co-Authored-By: Claude ...` trailer to commit messages. The user doesn't want Claude showing up in the repo's contributor list.
- Do NOT write comments!
- Do not use emojis, for gods sake.
