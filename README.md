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

## Project Structure

```
app/
  (public)/   landing, blogs, blogs/[slug], categories, about, contact
  (auth)/     login, signup
  (admin)/    dashboard + posts, categories, tags, comments, media,
              subscribers, messages
components/   public/ · admin/ · shared/
lib/          supabase/ · tiptap/ · utils/ · validations/
types/        generated Supabase types
supabase/     migrations/
middleware.ts session refresh + /admin guard
```

## Getting Started

> The app is not yet scaffolded. These are the intended steps once setup begins.

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment**, create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. **Database**, apply migrations and generate types:
   ```bash
   supabase db push
   supabase gen types typescript --project-id <id> > types/database.ts
   ```
4. **Run**
   ```bash
   npm run dev
   ```

## Scripts (planned)

| Command          | Purpose |
|------------------|---------|
| `npm run dev`    | Local dev server |
| `npm run build`  | Production build |
| `npm run lint`   | Lint |
| `npm run typecheck` | TypeScript check |

## Deployment

Deployed on **Vercel**, linked to this repo. Set the Supabase environment variables in the
Vercel project. Supabase migrations are managed via the Supabase CLI.
