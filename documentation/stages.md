# Pages from the Red Diary: Build Stages

> The full v1 (see `architecture.md` §8) is delivered as **ordered sub-projects**, not one big
> push. Each stage gets its own spec → implementation plan → build → review cycle. Stages are
> sequenced by dependency: every stage builds on the ones above it.

_Roadmap agreed 2026-06-15. Stages 1–6 are now implemented and launch-hardened. Remaining work is
final client content/hero-copy decisions plus live production checks, not core feature build._

---

## Stage 1 — Foundation & Database  (completed — see `stage1.md`)

Scaffold the app and make the database real. Everything else depends on this stage.

- Next.js 15 (App Router) + TypeScript (strict) scaffold
- Tailwind with the custom theme tokens (`tailwind.config.ts`, see `design.md`)
- The three Supabase clients: `lib/supabase/{client,server,middleware}.ts`
- Full initial migration in `supabase/migrations/`: enums, all tables, RLS on every table,
  the `posts_public` view, the `is_admin()` / view-count / search functions, and the
  `search_tsv` column + GIN index (see `database.md`)
- Seed data: the 6 fixed categories + sample posts (real Tiptap JSON, not hardcoded UI)
- Generated `types/database.ts`

**Done when:** the DB is real and RLS behaves — anon cannot read `posts.content`, readers cannot
read drafts or future-dated posts, admin can read everything; `types/database.ts` generates; the
app builds.

---

## Stage 2 — Auth & Session  (completed — see `stage2.md`)

- Signup / login pages (`(auth)` route group)
- Email/password via Supabase Auth, **email confirmation ON**
- `profiles` auto-create trigger on `auth.users` insert; default role `reader`
- `middleware.ts`: session refresh + guard `/admin/*` (must be `role='admin'`)
- Password reset: `forgot-password` (request a reset email) + `reset-password` (set a new password
  via the recovery session routed through `/auth/callback?next=/reset-password`)
- Duplicate-signup detection — an already-registered email returns "account already exists" instead
  of a silent confirmation resend
- Sign-in / sign-out confirmation toasts
- Admin status is read via the `is_admin()` RPC (the `profiles.role` column is not granted to
  `authenticated`), surfaced as the sticky **Admin Dashboard** link on public pages

**Done when:** sign up → confirm → authenticated session works; `/admin` is blocked for readers
and anonymous visitors; a user who forgets their password can reset it via email.

---

## Stage 3 — Public Site & Registration Wall  (completed; reading-wall RLS verified ✅)

- Global chrome: header (wordmark, nav, search affordance, Sign Up), footer, ornament
- Landing, blog listing, categories, about, contact pages (read from `posts_public`)
- Single-post page: public teaser (metadata) always rendered; **body gated** — only authenticated
  users get `posts.content`, enforced by RLS, never on the frontend alone
- Final post detail layout uses the selected Red Diary longform direction with the quieter
  article image frame, a Diary Index sidebar, and "From the Diary Archive" related entries.
- Shared Tiptap **read-only renderer** (`lib/tiptap/`), extension set identical to the editor

**Done when:** an anonymous visitor sees the teaser + "Sign in to keep reading" gate; an
authenticated reader sees the full body; the teaser is present in server-rendered HTML for SEO.

---

## Stage 4 — Admin Authoring  (completed; write-protection + media storage verified)

- Admin shell + sidebar + dashboard (`(admin)` route group)
- Post CRUD with the **Tiptap editor** (shared extension set with the renderer)
- Categories and tags management
- Media library backed by Supabase Storage; uploads support click-to-upload and single-file
  drag-and-drop with validation/status feedback
- All writes via **Server Actions** + Zod validation (`lib/validations/`), authorized by RLS
- **About / author content** is admin-editable via `/admin/about`: name, portrait, author-card
  role/location/currently reading/currently writing, bio, intro, "Why I Write", favourite quote,
  and timeline are stored in `site_settings` and editable through a two-pane form + live About
  preview plus a focused author-card preview.

**Done when:** the owner writes and publishes a post through the UI and it appears on the public
site with the correct reading wall behavior.

---

## Stage 5 — Engagement  (completed; bugs fixed + covered by tests)

- Moderated comments (one level of nesting via `parent_id`; new comments `approved = false`)
- Likes (one per user per post via `post_likes`)
- View analytics (per-post `view_count` via a `security definer` RPC; surfaced in the dashboard)
- Admin comments moderation queue

**Done when:** a reader comments → admin approves → the comment renders publicly; likes toggle
once per user; full-post views increment the count.

---

## Stage 6 — Capture, Search & SEO  (completed; search pagination/sort fixed + tested)

- Newsletter capture (footer form → `newsletter_subscribers`; capture only in v1)
- Contact form → `contact_messages` (admin Messages screen)
- Public contact email/location and Instagram/YouTube links are editable via `/admin/contact`
  (`site_settings.contact`) and also drive the footer social icons
- Full-text search via a `security definer` RPC that returns **safe columns only**
- `app/sitemap.ts`, RSS at `app/feed.xml/route.ts`, per-post `generateMetadata` (Open Graph)

**Done when:** search returns only published posts and never leaks gated bodies; sitemap and RSS
validate; subscribe and contact submissions persist and surface in the admin.

---

## Next — Launch Readiness

The feature UI for Stages 3–6 exists, is wired to the real backend, and has been launch-hardened.
Remaining work is final client content entry, hero-copy decision, and live production checks.

A four-layer test suite now exists: unit + integration (Vitest, `npm test`), DB/RLS checks
(`supabase/tests/rls_checks.sql` via `npm run test:rls`, owner-run), and Playwright anon/public e2e
(`npm run e2e`). The landing "featured post" ("The Essay to Begin With") is now admin-selectable
(`/admin/posts` star → `site_settings`, falling back to most-popular).

**Priority order**
1. ~~**Reading-wall / RLS audit (Stage 3)**~~ — **verified** ✅ (2026-06-17): anon is denied
   `posts.content` at the DB (401); `posts_public` carries no body; the teaser is in the
   server-rendered HTML and the body is not. (Still nice-to-have: a committed regression test
   asserting anon gets 0 rows from `posts`.)
2. **Admin authoring (Stage 4)** — write-protection verified (anon/RLS denied) and the `media`
   storage bucket + policies are provisioned (public read, admin-only write) with copy-URL, delete,
   and drag-and-drop upload affordances in the media library.
3. **Engagement (Stage 5)** — the tag-filter no-op and the like read-modify-write race are **fixed
   and covered by tests**; remaining is the live owner walkthrough (comment → approve → render, like
   toggle, view-count increment).
4. **Capture / Search / SEO (Stage 6)** — search pagination/count + tag filter + explicit sort are
   **fixed and tested**; contact/footer settings are admin-editable.
5. **A11y / contrast & UX hardening** — core handoff-review findings were addressed; remaining
   low-priority polish lives in `TODOs.md`.

**Production prerequisites**
- Custom SMTP provider (the built-in mailer is rate-limited) — see `consider.md`.
- Promote the owner account to `admin` once — see `README.md`.
- Configure Supabase Auth redirect URLs for the production domain.

The detailed, file-level backlog with priorities lives in `TODOs.md`.

---

> Architecture & feature context: `architecture.md`. Schema, RLS, view, functions: `database.md`.
> Palette, typography, layouts: `design.md` (+ `wireframes.png`).
