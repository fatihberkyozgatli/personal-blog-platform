# Placeholder Name: Build Stages

> The full v1 (see `architecture.md` §8) is delivered as **ordered sub-projects**, not one big
> push. Each stage gets its own spec → implementation plan → build → review cycle. Stages are
> sequenced by dependency: every stage builds on the ones above it.

> **Naming:** the brand name is not finalized. Use "Placeholder Name" everywhere a name is needed
> until the client provides the real one.

_Roadmap agreed 2026-06-15. **Stages 1–2 completed** (foundation, database, auth). The front-end UI
for the public site, admin portal, and engagement was built in parallel and merged onto the Stage
1–2 backend (2026-06-17); each later stage still needs its own verification/review pass._

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

## Stage 3 — Public Site & Registration Wall  (current)

- Global chrome: header (wordmark, nav, search affordance, Sign Up), footer, ornament
- Landing, blog listing, categories, about, contact pages (read from `posts_public`)
- Single-post page: public teaser (metadata) always rendered; **body gated** — only authenticated
  users get `posts.content`, enforced by RLS, never on the frontend alone
- Shared Tiptap **read-only renderer** (`lib/tiptap/`), extension set identical to the editor

**Done when:** an anonymous visitor sees the teaser + "Sign in to keep reading" gate; an
authenticated reader sees the full body; the teaser is present in server-rendered HTML for SEO.

---

## Stage 4 — Admin Authoring

- Admin shell + sidebar + dashboard (`(admin)` route group)
- Post CRUD with the **Tiptap editor** (shared extension set with the renderer)
- Categories and tags management
- Media library backed by Supabase Storage
- All writes via **Server Actions** + Zod validation (`lib/validations/`), authorized by RLS

**Done when:** the owner writes and publishes a post through the UI and it appears on the public
site with the correct reading wall behavior.

---

## Stage 5 — Engagement

- Moderated comments (one level of nesting via `parent_id`; new comments `approved = false`)
- Likes (one per user per post via `post_likes`)
- View analytics (per-post `view_count` via a `security definer` RPC; surfaced in the dashboard)
- Admin comments moderation queue

**Done when:** a reader comments → admin approves → the comment renders publicly; likes toggle
once per user; full-post views increment the count.

---

## Stage 6 — Capture, Search & SEO

- Newsletter capture (footer form → `newsletter_subscribers`; capture only in v1)
- Contact form → `contact_messages` (admin Messages screen)
- Full-text search via a `security definer` RPC that returns **safe columns only**
- `app/sitemap.ts`, RSS at `app/feed.xml/route.ts`, per-post `generateMetadata` (Open Graph)

**Done when:** search returns only published posts and never leaks gated bodies; sitemap and RSS
validate; subscribe and contact submissions persist and surface in the admin.

---

> Architecture & feature context: `architecture.md`. Schema, RLS, view, functions: `database.md`.
> Palette, typography, layouts: `design.md` (+ `wireframes.png`).
