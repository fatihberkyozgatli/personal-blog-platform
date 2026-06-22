# Pages from the Red Diary: Admin-Editable About / Author Content

> Design spec. Agreed 2026-06-17. Part of Stage 4 (Admin Authoring). Makes the currently
> hardcoded About page content (and the post-page author card) editable from the admin portal,
> stored in the database and gated by RLS — without changing the page's visual format or ornaments.

---

## 1. Goal & Scope

The About page and the author card on the single-post page currently render from a hardcoded
`author` object in `lib/site.ts`. The owner cannot change their name, portrait, bio, favourite
quote, "Why I Write" text, or timeline without a code change and deploy.

**Goal:** move all of that content into the database and let the admin edit it through the admin
portal, reusing the existing format/layout/ornaments verbatim. Security stays in the DB (RLS):
public reads, admin-only writes.

**In scope (full coverage, agreed):**
- `name`, `short` (author-card blurb), `portraitUrl`
- `intro`, `bio`, `why` — rich text (Tiptap), full editorial feature set
- `favoriteQuote` (`text` + `source`)
- `timeline` — repeatable `{ year, label }` rows (add / remove / reorder)

**Out of scope (YAGNI):** generic multi-key site settings, multiple authors, profile editing for
readers, scheduled/versioned About content. The store is shaped so a future settings group can be
added without rework, but we build only the About/author group now.

---

## 2. Data Model — the `about` document

Stored as a single JSONB document (validated by Zod on every write), mirroring how `posts.content`
stores Tiptap JSON.

```
name           : string                       // About heading + post author card
short          : string                       // post-page author card blurb
portraitUrl    : string | null                // Supabase Storage URL (media library)
intro          : Tiptap JSON                   // the "space for slow thinking" block
bio            : Tiptap JSON
why            : Tiptap JSON
favoriteQuote  : { text: string, source: string }   // plain text; format styles it
timeline       : { year: string, label: string }[]  // ordered; add / remove / reorder
```

- **Prose fields** (`intro`, `bio`, `why`) are Tiptap JSON using the **same shared extension set**
  as posts (`lib/tiptap/extensions.ts`) — full features (paragraph, headings, bold/italic, link,
  lists, blockquote). Rendered with the existing shared renderer (`lib/tiptap/render.ts`,
  `generateHTML` + sanitize) so editor↔renderer parity holds by construction.
- **Scalar / structured fields** (`name`, `short`, `portraitUrl`, `favoriteQuote`, `timeline`) are
  plain — the surrounding format already styles them.

---

## 3. Storage, Migration & RLS

New singleton table:

```sql
create table site_settings (
  key        text primary key,        -- 'about' for this group
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table site_settings enable row level security;

-- public read (the About page is public)
create policy site_settings_select on site_settings for select
  to anon, authenticated using (true);

-- admin-only write
create policy site_settings_write on site_settings for all
  to authenticated using (is_admin()) with check (is_admin());

grant select on site_settings to anon, authenticated;
grant insert, update on site_settings to authenticated;  -- RLS still restricts writes to is_admin()
```

- **No SQL content seed.** The default content lives once, in TypeScript (`defaultAbout`, see §4),
  and `getAboutContent()` falls back to it when the `'about'` row is missing. The row is created on
  the admin's first save (upsert). This keeps the default content DRY (one source, no SQL/TS drift).
- `updated_at` set by the server action on each write.
- Regenerate `types/database.ts` after the migration (or hand-add the table type if the CLI is
  unavailable — see the plan).

---

## 4. Public Read Path

- New module `lib/data/about.ts` owns the About data: the `AboutContent` type (inferred from the
  Zod schema), the `defaultAbout` constant (typed defaults, prose as minimal Tiptap docs), and
  `getAboutContent()` — reads the `'about'` row, validates/parses, and **falls back to
  `defaultAbout`** if the row is missing or malformed (page never renders blank). Captures and logs
  `error` (avoids the silent-swallow pattern flagged in `TODOs.md`).
- `lib/site.ts` (whose only export `author` is replaced by this) is **deleted** once both call
  sites read from `getAboutContent()`.
- Extract the About presentational markup into `components/public/AboutView.tsx` that takes the
  `about` document as props. The public `app/(public)/about/page.tsx` becomes a thin server
  component: fetch → render `AboutView`. Prose is rendered server-side (sanitized HTML).
- The single-post author card (`app/(public)/blogs/[slug]/page.tsx`) reads `name`/`short`/
  `portraitUrl` from the same `getAboutContent()` instead of importing `author` directly.

---

## 5. Admin Editing UI (`/admin/about`)

- New route `app/(admin)/admin/about/page.tsx` + a sidebar entry "About"
  (`components/admin/AdminSidebar.tsx`).
- Two-pane layout like the post editor: **left** a structured form (text inputs for `name`/`short`/
  quote; Tiptap editors for `intro`/`bio`/`why`; a timeline rows editor with add/remove/reorder; a
  portrait picker), **right** a live preview that renders the real `AboutView`.
- **Portrait** uses the existing `MediaUploader` (reuse), writing the resulting Storage URL to
  `portraitUrl`.
- **Preview prose** must NOT ship `sanitize-html`/`@tiptap/html` to the client (the known
  `PostPreview` P1 issue). Render the prose preview via a server action returning sanitized HTML
  (or the editor's own live HTML) rather than importing the Node renderer into a client component.

---

## 6. Mutation, Validation & Revalidation

- Server Action `updateAbout` in `lib/actions/` (admin actions), guarded by RLS (admin-only write
  at the DB; non-admin callers rejected).
- Zod schema in `lib/validations/about.ts`: validates the full document shape (string lengths,
  Tiptap JSON is an object, timeline entry shape, quote fields). Reject on parse failure with a
  field-level error surfaced in the form.
- On success: upsert the `'about'` row, then `revalidatePath('/about')` and revalidate the post
  pages so the author card refreshes.

---

## 7. Testing

- Zod schema unit tests (`lib/validations/about.test.ts`): valid document passes; malformed
  timeline / missing required fields fail.
- A test asserting `getAboutContent()` returns the `defaultAbout` constant (from `lib/data/about.ts`) when no row exists.

---

## 8. Documentation to Update (before/after)

Keep the markdown docs in sync as part of this work:
- `documentation/architecture.md` — note the About/author content is DB-backed editable (Feature
  Notes + routing map: add `admin/about`).
- `documentation/database.md` — add the `site_settings` table, its RLS, and the seed note.
- `documentation/stages.md` — record this under Stage 4 (admin authoring) progress.
- `README.md` — add `admin/about` to the structure/route map if listed.
- `TODOs.md` — note the PostPreview client-bundle pattern is avoided here (and cross-link if the
  shared fix lands).
- This spec stays as the design record.

---

## 9. Build Order (high level)

1. Migration: `site_settings` + RLS (no content seed); regen `types/database.ts`.
2. `lib/validations/about.ts` (Zod) + tests.
3. `lib/data/about.ts`: `AboutContent` type, `defaultAbout`, `getAboutContent()` with fallback + test.
4. Extract `AboutView`; point the public About page + post author card at `getAboutContent()`;
   delete `lib/site.ts`.
5. `updateAbout` server action (`lib/actions/about.ts`) + revalidation.
6. Admin `/admin/about` screen (form + Tiptap + timeline editor + media portrait + live preview);
   small enabling tweaks to `TiptapEditor`/`MediaUploader`; sidebar entry.
7. Doc updates; per-stage review gate (code / security / UI-UX) before any commit.
