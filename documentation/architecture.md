# Placeholder Name: Architecture

> A personal reflections blog (faith, history, literature, society, personal growth) with an
> Ottoman/Persian editorial aesthetic. Public marketing and listing pages are open to everyone;
> **reading the full body of a post requires a free account** (a registration wall). The site
> owner manages everything through a custom admin portal.

> **Naming:** "Placeholder Name" is a temporary working title. The client has not provided the
> real brand name yet, so no name should be written anywhere until they do.

---

## 1. Tech Stack

| Layer        | Choice                                              | Notes |
|--------------|-----------------------------------------------------|-------|
| Framework    | **Next.js 15** (App Router) + **TypeScript**        | Greenfield, so start on the latest stable rather than 14. |
| Styling      | **Tailwind CSS** + custom theme                     | Brand tokens in `tailwind.config.ts`. See `design.md`. |
| Backend      | **Supabase** (Postgres + Auth + Storage)            | Security lives in the DB via Row Level Security. |
| Editor       | **Tiptap** (headless, ProseMirror)                  | Content stored as JSON. |
| Email (txn)  | Supabase Auth (signup/confirm/reset)                | No external ESP in v1. Newsletter is capture only. |
| Hosting      | **Vercel**                                          | Preview deploys per branch; edge middleware for auth. |

---

## 2. Rendering Strategy

- **Default to React Server Components.** Public pages are server-rendered for speed and SEO.
- **Client Components only where interaction requires it:** auth forms, search box, comment
  composer, the Tiptap editor, and admin forms.
- **Route groups** keep the three audiences cleanly separated:
  - `(public)`: landing, blog listing, single post, categories, about, contact
  - `(auth)`: login, signup
  - `(admin)`: dashboard and all management screens (protected)

### The post detail page (the heart of the wall)
The single-post page is a Server Component that **always renders public metadata**
(title, cover, excerpt, category, date, reading time) so search engines index the teaser.
The **body renders only for authenticated users**:

```
if (!session)  → render teaser + "Sign in to keep reading" CTA   (body never sent to client)
if (session)   → fetch full post (incl. content JSON) and render it
```

Because the body is fetched server-side and gated by RLS, an anonymous visitor cannot obtain
the content even by hitting the API directly. The gate is enforced in the database, not the UI.

---

## 3. Data Mutations: Server Actions

All admin writes (create/update/delete posts, categories, tags, moderate comments, manage media)
go through **Next.js Server Actions** using the Supabase **server** client. No bespoke REST layer.

- Validation with **Zod** schemas in `lib/validations/`.
- Each action runs under the caller's session, so RLS authorizes it. Admin-only tables simply
  reject non-admin callers at the DB level.

---

## 4. Supabase Clients

Three thin factories in `lib/supabase/`:

| File            | Used in                          | Purpose |
|-----------------|----------------------------------|---------|
| `client.ts`     | Client Components                | Browser client (anon key). |
| `server.ts`     | Server Components & Server Actions | Reads cookies, runs under the user session. |
| `middleware.ts` | `middleware.ts` (root)           | Refreshes the session cookie on each request. |

Never use the service-role key in code that reaches the browser. v1 does not require the
service-role key at all: RLS plus the user session cover every operation.

---

## 5. Auth Flow

- **Email/password** via Supabase Auth, **email confirmation ON** (reduces fake signups that
  exist only to read gated content).
- **Roles:** `admin` or `reader`, stored on `profiles.role`. The owner's profile is promoted to
  `admin` manually (one-time SQL/dashboard step). Everyone who self-signs-up is a `reader`.
- **`middleware.ts`** refreshes the session and **guards `/admin/*`**, redirecting non-admins
  to `/login`. The reading wall itself is enforced per-page (server-side) and by RLS, not by
  middleware.

---

## 6. Feature Notes

- **Search (v1):** Postgres full-text search (a `tsvector` over title + excerpt + content),
  exposed through an RPC or a query against `posts_public`. No Algolia or external service.
- **Comments (v1, moderated):** signed-in readers post and reply (one level of nesting via
  `parent_id`). New comments default to `approved = false` and surface in the admin **Comments**
  queue. Only approved comments render publicly.
- **Reactions/likes (v1):** signed-in readers can like a post (one like per user, tracked in
  `post_likes`). The like count shows on the post and in the admin dashboard.
- **View analytics (v1):** each full-post view increments `posts.view_count` through a
  `security definer` RPC. The admin dashboard surfaces per-post view counts. Richer time-series
  analytics can come later.
- **Newsletter (v1, capture only):** the footer "Join the Journey" form inserts into
  `newsletter_subscribers`. No sending in v1; the owner can export the list. An ESP can be added
  later without schema changes.
- **Contact (v1):** the contact form inserts into `contact_messages`, visible in the admin
  **Messages** screen. (Optional email notification can be layered in later.)
- **Media library:** images upload to **Supabase Storage**; rows tracked in `media`. The Tiptap
  editor and the cover-image picker both draw from here. Configure `next.config` `remotePatterns`
  for the Supabase Storage domain so `next/image` can optimize them.
- **SEO:** `app/sitemap.ts` and an RSS feed (`app/feed.xml/route.ts`) generated from published
  posts; per-post `generateMetadata` (Open Graph using cover image + excerpt).

---

## 7. Routing Map

```
app/
  (public)/
    page.tsx                  landing
    blogs/page.tsx            post listing (cards from posts_public)
    blogs/[slug]/page.tsx     single post (teaser public, body gated)
    categories/page.tsx       browse by category
    about/page.tsx
    contact/page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
  (admin)/
    admin/page.tsx            dashboard (incl. view + like analytics)
    admin/posts/page.tsx      list/manage
    admin/posts/new/page.tsx  create (Tiptap)
    admin/posts/[id]/edit/page.tsx
    admin/categories/page.tsx
    admin/tags/page.tsx
    admin/comments/page.tsx   moderation queue
    admin/media/page.tsx      media library
    admin/subscribers/page.tsx newsletter export
    admin/messages/page.tsx   contact messages
middleware.ts                 session refresh + /admin guard
```

Supporting code: `components/{public,admin,shared}`, `lib/{supabase,tiptap,utils,validations}`,
`types/` (generated DB types), `supabase/migrations/`.

---

## 8. v1 Scope Checklist

**In v1**
- [ ] Public landing, listing, category, about, contact pages
- [ ] Registration wall on full post bodies (DB-enforced)
- [ ] Email/password auth with confirmation; admin role
- [ ] Admin: post CRUD with Tiptap, categories, tags, media library
- [ ] Moderated comments (nested one level)
- [ ] Reactions/likes on posts
- [ ] View analytics (per-post view counts in admin)
- [ ] Full-text search
- [ ] Newsletter email capture
- [ ] Contact form → admin messages
- [ ] Sitemap + RSS + per-post OG metadata

**Deferred (v2+)**
- ESP integration and sending newsletters
- Richer time-series analytics and dashboards
- Scheduled-publish UI beyond "future `published_at`"

---

## 9. Deployment

- Vercel project linked to the repo; environment variables for Supabase URL + anon key.
- Supabase migrations under `supabase/migrations/` applied via the Supabase CLI.
- Preview deploys per branch for reviewing post layouts before publishing.

> Design system (colors, typography, component patterns, page-by-page layout): see `design.md`.
> Full schema, enums, RLS policies, the `posts_public` view, seeds: see `database.md`.
