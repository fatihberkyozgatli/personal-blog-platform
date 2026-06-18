# Placeholder Name: Stage 1 — Foundation & Database

## Status: COMPLETED (2026-06-15)

A running Next.js 15 (App Router, TypeScript strict) app wired to a real hosted Supabase database.
Nothing hardcoded — content flows through real queries. Source of truth for the schema is the
migration files plus `database.md`; this doc records what was built and the final security model.

## What was built

- **Scaffold:** Next.js 15 App Router, TS strict, ESLint, Tailwind v3 with the `design.md` theme
  tokens, Playfair Display + Inter via `next/font`.
- **Env:** `lib/env.ts` validates `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  with Zod and throws at startup if either is missing. Unit-tested with Vitest.
- **Supabase clients:** `lib/supabase/{client,server,middleware}.ts` and root `middleware.ts`
  (session refresh). The `/admin` role guard is Stage 2.
- **Migrations** (`supabase/migrations/`):
  - `20260615185524_init.sql` — enums, all 10 tables + indexes, the `posts_public` /
    `profiles_public` views, the `is_admin` / `increment_post_view` / `search_posts`
    `security definer` functions, the `search_tsv` full-text column + GIN index, the
    `handle_new_user` and `set_updated_at` triggers, and RLS on every table.
  - `20260615190000_security_invoker_views.sql` and `20260615190500_grant_public_post_status.sql`
    — the final security model below.
- **Seed** (`supabase/seed.sql`, idempotent): 6 categories, a few tags, 5 published + 1 draft + 1
  future-dated post (placeholder Tiptap JSON bodies, `cover_image = null`). Author is the `admin`
  profile, looked up at run time, so no UID is hardcoded.
- **Types:** `types/database.ts` generated from the live schema via `npm run db:types`
  (`supabase gen types typescript --linked`).
- **RLS proof:** `supabase/tests/rls_checks.sql` (role-simulating; see Verification).

## Final security model (the registration wall)

The public views (`posts_public`, `profiles_public`) use `security_invoker = true`, so they run
under the querying user's privileges (this clears Supabase's "security-definer view" advisory). The
wall is enforced with column-level grants plus RLS:

- **`posts`:** `anon` is granted SELECT on only the safe columns (never `content`) and a policy
  limits it to `status = 'published' AND published_at <= now()`. `authenticated` is granted the
  full row (including `content`), gated by RLS to published/non-future rows or admin. `admin` sees
  everything. So `select content from posts` as `anon` fails at the column-grant level.
- **`profiles`:** `anon` and `authenticated` may read only the safe columns (`id`, `display_name`,
  `avatar_url`); `role` is not granted and stays private (reachable only via `is_admin()`).
- **`post_tags` / `post_likes` / `comments`** SELECT policies are scoped to published posts.
- The **app** reads card data through `posts_public` and the full body through base `posts`
  (authenticated only). The DB also permits `anon` safe-column reads on `posts` directly, which is
  what makes the `security_invoker = true` view work.

## Verification

- `build` / `typecheck` / `lint` / `test` (15/15 across 5 files) all green.
- Migrations applied to the hosted project; `types/database.ts` generated from the live schema.
- `rls_checks.sql` run against the live DB: `anon` cannot read `posts.content`
  (column-level `insufficient_privilege`); `anon`/`reader` cannot see drafts or future-dated posts;
  `reader` cannot INSERT a post; `admin` sees drafts and future posts. It also exercises the
  `anon` newsletter insert path. (The script does not assert every table's policy — it covers the
  wall-critical ones.)
- `app/(public)/page.tsx` is currently a static placeholder; live DB connectivity was verified via
  the RLS proof and type generation. The real landing page is built in Stage 3.

## Follow-ups for later stages

- Stage 4's admin UI will need a path to read `profiles.role` (now only reachable via `is_admin()`).
- `20260615190500`'s `grant select (status)` is redundant with the column grant in `190000`, but is
  kept as-is — it is an already-applied migration and applied migrations are not edited or dropped.
- The placeholder `app/(public)/page.tsx` is replaced by the real landing page in Stage 3.

> Next: Stage 2 — Auth & Session (`stage2.md`). Schema/RLS source of truth: migrations + `database.md`.
