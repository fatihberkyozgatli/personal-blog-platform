# Placeholder Name

> "Placeholder Name" is a temporary working title. The client has not provided the real brand
> name yet, so no name is written anywhere in the codebase until they do.

A personal reflections blog: thoughts on faith, history, literature, society, and personal
growth, with an Ottoman/Persian editorial aesthetic. The public site (landing, post listings,
categories, about, contact) is open to everyone, while **reading the full body of a post requires
a free account**. The owner writes and manages everything through a built-in admin portal.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (custom Ottoman/Persian theme)
- **Supabase**: Postgres, Auth, Storage (security enforced via Row Level Security)
- **Tiptap**: headless rich-text editor; content stored as JSON
- **Vercel**: hosting and preview deploys

## Documentation

| Doc | Contents |
|-----|----------|
| [`documentation/architecture.md`](documentation/architecture.md) | System design, rendering strategy, auth, the registration wall, feature notes, v1 scope |
| [`documentation/database.md`](documentation/database.md) | Schema, enums, RLS policies, the `posts_public` view, search, seeds |
| [`documentation/design.md`](documentation/design.md) | Brand palette, typography, component & page layouts |
| `documentation/wireframes.png` | Landing-page design reference |
| [`documentation/stages.md`](documentation/stages.md) | Build roadmap and per-stage progress (each stage has a `stageN.md` spec) |
| [`documentation/consider.md`](documentation/consider.md) | Deferred items to revisit (profile editing, custom SMTP) |

## Project Structure

```
app/
  (public)/   landing, blogs, blogs/[slug], categories, about, contact
  (auth)/     login, signup, forgot-password, reset-password
  (admin)/    dashboard + posts, categories, tags, comments, media,
              subscribers, messages, about
components/   public/ · admin/ · shared/
lib/          supabase/ · tiptap/ · utils/ · validations/ · data/ · actions/
types/        generated Supabase types
supabase/     migrations/
middleware.ts session refresh + /admin guard
```

## Getting Started

> **Stages 1–2 (Foundation, Database, Auth) are complete** — the app is scaffolded, wired to a
> hosted Supabase project, with email/password auth and the `/admin` guard (see
> `documentation/stages.md` for progress). The steps below set up a fresh clone.

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment**, create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. **Database** — link, apply migrations, and generate types with the Supabase CLI **v2** (the
   hosted database is Postgres 17, which the v1 CLI cannot target):
   ```bash
   npx supabase@latest link --project-ref <your-project-ref>
   npx supabase@latest db push
   npx supabase@latest gen types typescript --linked > types/database.ts
   ```
4. **Promote the owner to admin** (one time) — sign up through the app, then run in the Supabase
   SQL editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
5. **Run**
   ```bash
   npm run dev
   ```

> **Email:** the built-in Supabase mailer is for testing only and tightly rate-limited (repeated
> signups hit `email rate limit exceeded`). Configure a custom SMTP provider before production —
> see `documentation/consider.md`.

## Scripts

| Command          | Purpose |
|------------------|---------|
| `npm run dev`    | Local dev server |
| `npm run build`  | Production build |
| `npm run lint`   | Lint |
| `npm run typecheck` | TypeScript check |
| `npm test`       | Unit tests (Vitest) |

## Deployment

Deployed on **Vercel**, linked to this repo. Set the Supabase environment variables in the
Vercel project. Supabase migrations are managed via the Supabase CLI.
