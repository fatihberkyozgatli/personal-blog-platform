# Placeholder Name: Database

Postgres on Supabase. **Security lives here**, not in the frontend: Row Level Security (RLS) is
enabled on every table, and the registration wall is enforced via a column-limited view.

---

## 1. Enums

```sql
create type user_role   as enum ('admin', 'reader');
create type post_status as enum ('draft', 'published');
```

> Note: there is intentionally **no `scheduled` status**. A post scheduled for the future is
> simply `status = 'published'` with a `published_at` in the future; public queries filter
> `published_at <= now()`, so it appears automatically with no cron job.

---

## 2. Tables

### `profiles` (extends Supabase `auth.users`)
| column        | type          | notes |
|---------------|---------------|-------|
| id            | uuid PK       | = `auth.users.id` (FK, on delete cascade) |
| display_name  | text          | shown as the author / commenter name |
| role          | user_role     | default `'reader'` |
| avatar_url    | text null     | optional |
| created_at    | timestamptz   | default `now()` |

Email/password live in `auth.users`, **not** duplicated here. A new row is created via a
trigger on `auth.users` insert (or on first login).

### `posts`
| column        | type          | notes |
|---------------|---------------|-------|
| id            | uuid PK       | default `gen_random_uuid()` |
| title         | text          | |
| slug          | text          | **unique** |
| cover_image   | text null     | Supabase Storage URL |
| excerpt       | text          | public teaser |
| content       | jsonb         | Tiptap document JSON (gated) |
| status        | post_status   | default `'draft'` |
| published_at  | timestamptz null | when it goes live |
| reading_time  | int           | minutes, computed on save |
| view_count    | int           | default `0`, incremented per full-post view (see §5) |
| category_id   | uuid null FK → categories | |
| author_id     | uuid FK → profiles | the owner's profile |
| created_at    | timestamptz   | default `now()` |
| updated_at    | timestamptz   | maintained by trigger |

Indexes: unique on `slug`; index on `(status, published_at)`; index on `category_id`.

### `categories` *(seeded, see §7)*
| column      | type     | notes |
|-------------|----------|-------|
| id          | uuid PK  | |
| name        | text     | |
| slug        | text     | unique |
| description | text null| |
| icon        | text null| optional icon key from the curated set in `lib/category-icons` (migration `20260615191000`) |

### `tags`
| column | type    | notes |
|--------|---------|-------|
| id     | uuid PK | |
| name   | text    | |
| slug   | text    | unique |

### `post_tags` *(join)*
| column  | type | notes |
|---------|------|-------|
| post_id | uuid FK → posts (cascade) | |
| tag_id  | uuid FK → tags  (cascade) | |
> Composite primary key `(post_id, tag_id)`.

### `comments`
| column     | type        | notes |
|------------|-------------|-------|
| id         | uuid PK     | |
| post_id    | uuid FK → posts (cascade) | |
| user_id    | uuid FK → profiles | |
| parent_id  | uuid null FK → comments | one level of replies |
| body       | text        | |
| approved   | boolean     | **default `false`** (moderation queue) |
| created_at | timestamptz | default `now()` |

### `post_likes` *(one like per user per post)*
| column     | type        | notes |
|------------|-------------|-------|
| post_id    | uuid FK → posts (cascade) | |
| user_id    | uuid FK → profiles (cascade) | |
| created_at | timestamptz | default `now()` |
> Composite primary key `(post_id, user_id)` enforces a single like per user. The like count is
> `count(*)` over `post_likes` for a post (or a cached counter if needed later).

### `media`
| column      | type        | notes |
|-------------|-------------|-------|
| id          | uuid PK     | |
| url         | text        | Storage public/signed URL |
| filename    | text        | |
| mime_type   | text        | |
| size        | int         | bytes |
| width       | int null    | |
| height      | int null    | |
| uploaded_by | uuid FK → profiles | |
| created_at  | timestamptz | default `now()` |

### `newsletter_subscribers`
| column     | type        | notes |
|------------|-------------|-------|
| id         | uuid PK     | |
| email      | text        | **unique** |
| created_at | timestamptz | default `now()` |

### `contact_messages`
| column     | type        | notes |
|------------|-------------|-------|
| id         | uuid PK     | |
| name       | text        | |
| email      | text        | |
| subject    | text null   | |
| body       | text        | |
| read       | boolean     | default `false` |
| created_at | timestamptz | default `now()` |

### `site_settings`
| column     | type        | notes |
|------------|-------------|-------|
| key        | text PK     | e.g. `'about'` |
| value      | jsonb       | document stored as JSONB |
| updated_at | timestamptz | set by the server action on each write |

Stores singleton site configuration documents. Known keys:

- `about` — About/author document, validated against `lib/validations/about.ts`. Falls back to
  the `defaultAbout` constant when the row is missing; created on the admin's first save.
- `featured_post` — `{ "post_id": "<uuid>" | null }`. Identifies the admin-pinned landing-page
  hero. When `post_id` is null or the row is absent, the read path falls back to the
  most-popular published post.

---

## 3. The Registration Wall: `posts_public` view

RLS is row-level and cannot hide a single *column*. To keep `content` private while exposing the
card data publicly, we expose a **view with only the safe columns**:

```sql
create view posts_public
with (security_invoker = true) as
select
  p.id, p.title, p.slug, p.cover_image, p.excerpt,
  p.category_id, p.author_id, p.published_at, p.reading_time, p.view_count, p.created_at,
  pr.display_name as author_name
from posts p
join profiles pr on pr.id = p.author_id
where p.status = 'published' and p.published_at <= now();

grant select on posts_public to anon, authenticated;
```

- Listings, the landing page, and the **post teaser** read from `posts_public`, never `content`.
- The full body reads from the base `posts` table, where anonymous users are granted only the
  safe public columns and never `content`. Authenticated users may select published full rows
  (see policies below).

---

## 4. RLS Policies (intent)

Enable RLS on every table. Summary of who can do what:

| Table                    | anon            | authenticated (reader)                          | admin |
|--------------------------|-----------------|-------------------------------------------------|-------|
| `posts`                  | SELECT safe published columns only, never `content` | SELECT where `status='published' AND published_at<=now()` | ALL (incl. drafts) |
| `posts_public` (view)    | SELECT          | SELECT                                          | SELECT |
| `categories`             | SELECT          | SELECT                                          | ALL |
| `tags`                   | SELECT          | SELECT                                          | ALL |
| `post_tags`              | SELECT          | SELECT                                          | ALL |
| `comments`               | SELECT `approved=true` | SELECT (`approved=true` OR own); INSERT own (`approved` forced false); DELETE own | ALL |
| `post_likes`             | SELECT (counts) | SELECT; INSERT/DELETE own (`user_id=auth.uid()`) | ALL |
| `media`                  | none            | none                                            | ALL |
| `profiles`               | SELECT (display_name, avatar) | SELECT own + public author fields; UPDATE own | ALL |
| `newsletter_subscribers` | INSERT          | INSERT                                          | SELECT, DELETE |
| `contact_messages`       | INSERT          | INSERT                                          | SELECT, UPDATE (`read`) |
| `site_settings`          | SELECT          | SELECT                                          | ALL (via `is_admin()`) |

Helper for admin checks (avoids recursive policy lookups):

```sql
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
```

Comment INSERT must force the trusted columns server-side / via policy `with check`:
`user_id = auth.uid()` and `approved = false`. Like INSERT must force `user_id = auth.uid()`.

---

## 5. View Counting

A `security definer` RPC increments the counter so anonymous and authenticated viewers alike are
counted without granting direct UPDATE on `posts`:

```sql
create or replace function increment_post_view(p_slug text)
returns void language sql security definer as $$
  update posts set view_count = view_count + 1
  where slug = p_slug and status = 'published' and published_at <= now();
$$;
```

Called once per full-post render. The admin dashboard reads `view_count` (and like counts) per
post. Richer time-series analytics are deferred to a later version.

---

## 6. Full-Text Search

```sql
alter table posts add column search_tsv tsvector
  generated always as (
    to_tsvector('simple',
      coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' ||
      coalesce(content::text,''))
  ) stored;
create index posts_search_idx on posts using gin (search_tsv);
```

Search runs through a `security definer` RPC that returns only safe columns for published posts,
so search never leaks gated bodies to anonymous users.

---

## 7. Seed Data

Categories (fixed set from the design):

```
Reflections, Faith, History, Literature, Society, Personal Growth
```

The owner's account is promoted once:

```sql
update profiles set role = 'admin' where id = '<owner-auth-uid>';
```

---

## 8. Storage

- Bucket `media` for cover images and in-content images.
- Public read (or signed URLs); writes restricted to admins via Storage policies.
- Add the Storage hostname to `next.config` `images.remotePatterns` for `next/image`.

---

## 9. Types

Generate TypeScript types from the live schema and keep them in `types/`:

```
supabase gen types typescript --project-id <id> > types/database.ts
```

> Migrations live in `supabase/migrations/`. Architecture and feature context: see
> `architecture.md`.
