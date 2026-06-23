# Pages from the Red Diary: Admin-Selected Featured Post

> Design spec. Agreed 2026-06-21. Lets the owner choose which published post appears in the
> landing page's "The Essay to Begin With" section, instead of the current "most popular" heuristic.
> Single-select, toggleable, theme-consistent — reusing `site_settings`, no schema migration.

---

## 1. Goal & Decisions

Today the landing "The Essay to Begin With" section shows whatever `getFeaturedPost()` returns —
currently the most-popular published post (`getPosts({ perPage: 1, sort: "popular" })`). The owner
has no control over it.

**Goal:** let the admin pick the featured post from the admin posts list (single-select), with the
landing page honoring that choice.

**Decisions (agreed):**
- **Empty state / fallback:** when nothing is featured (or the featured post is no longer live —
  unpublished, future-dated, or deleted), fall back to the current most-popular behavior so the
  section is always filled.
- **Toggle off allowed:** the admin can have NO featured post (clicking the featured star again
  clears it → fallback).
- **Only published posts** can be featured (the star is shown only on published rows; the server
  also validates).

---

## 2. Storage

A single `site_settings` row (the table already exists; RLS = public SELECT, admin write):
- `key = 'featured_post'`
- `value = { "post_id": "<uuid>" }`  — and `{ "post_id": null }` when toggled off.

A single value inherently enforces single-select (no "unset the others" logic needed). No schema
migration. Toggle-off uses `post_id: null` (an UPSERT) rather than deleting the row, because
`site_settings` grants `insert, update` to `authenticated` but not `delete`.

---

## 3. Read Path (landing) — update `getFeaturedPost()`

`lib/data/posts.ts` `getFeaturedPost()`:
1. Read `site_settings` where `key = 'featured_post'` → `post_id` (may be null/absent).
2. If `post_id` is set: fetch that row from `posts_public` (which only returns published,
   `published_at <= now()`). If found → map and return it.
3. Otherwise (no setting, null, or the post isn't live) → fall back to the current behavior:
   `getPosts({ perPage: 1, sort: "popular" })`.

This keeps the section resilient: a deleted/unpublished featured post silently degrades to
most-popular. Capture and log Supabase `error` (no silent swallow).

A small accessor `getFeaturedPostId(): Promise<string | null>` reads the setting; both the landing
read path and the admin page (to mark the starred row) use it.

---

## 4. Write Path — Server Action `setFeaturedPost`

`setFeaturedPost(formData)` (admin action; `lib/actions/admin.ts`):
- Reject non-admins (`ensureAdmin()` / RLS).
- Read the `id` from the form.
- Validate the post is **published** (fetch its `status`; if not `published`, return without
  setting — the UI only shows the star on published rows, this is defense-in-depth).
- Read the current `featured_post.post_id`. If it equals the submitted `id` → set
  `{ post_id: null }` (toggle off). Otherwise → set `{ post_id: id }`. UPSERT on
  `site_settings (key='featured_post')`.
- `revalidatePath('/')` (landing) and `revalidatePath('/admin/posts')`.

---

## 5. Admin UI — star toggle in the posts table

`app/(admin)/admin/posts/page.tsx` (server component) gains a **"Featured" column** before Actions.
The page fetches `getFeaturedPostId()` once and marks each row.

Per row:
- **Published posts:** a server-action `<form action={setFeaturedPost}>` with a hidden `id` and a
  star button (lucide `Star`) — mirrors the existing `deletePost` form pattern (no client JS,
  progressive enhancement). Featured row → filled gold star (`fill-current text-gold-700`); others →
  outline (`text-ink-muted`, hover gold). `aria-label`: "Featured — remove from homepage" when
  active, "Feature on homepage" otherwise.
- **Draft / future posts:** no star (a muted dash or empty cell) — only published posts are
  featurable.

`listPosts` (`lib/data/admin.ts`) already returns `status`, so the page can decide which rows get a
star. The featured id comes from `getFeaturedPostId()`.

---

## 6. Edge Cases

- Featured post later unpublished / future-dated / deleted → the read path (§3) finds nothing in
  `posts_public` and falls back to most-popular. The stale `post_id` setting is left as-is (harmless;
  not cleaned — YAGNI).
- No admin / not configured → `getFeaturedPost` falls back to most-popular (current behavior),
  unchanged.

---

## 7. Testing

Integration tests (mocked Supabase, the existing `tests/helpers/mock-supabase.ts` pattern):
- `setFeaturedPost`: sets the id for a published post; toggles off when the same id is re-submitted;
  rejects a non-admin (no `site_settings` write); refuses a non-published post.
- `getFeaturedPost`: returns the configured post when it is live; falls back to the popular query
  when the setting is unset, null, or the post is not in `posts_public`.

---

## 8. Out of Scope (YAGNI)

- Featuring multiple posts / a featured-posts list.
- Auto-clearing the setting when a post is unpublished/deleted (the read-path fallback covers it).
- Reordering / scheduling the featured post.

---

## 9. Files

- Modify `lib/data/posts.ts` — `getFeaturedPost()` honors the setting; add `getFeaturedPostId()`.
- Modify `lib/actions/admin.ts` — add `setFeaturedPost`.
- Modify `app/(admin)/admin/posts/page.tsx` — Featured column + star toggle form.
- Add `tests/integration/featured.test.ts`.
- Docs: note the feature in `architecture.md` (feature notes) and `database.md`
  (`site_settings` keys: `about`, `contact`, `featured_post`).
