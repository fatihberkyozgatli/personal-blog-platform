# TODOs — Review Findings

Consolidated from a three-way review (code correctness · frontend/UI-UX · security) run on the current branch. Items are grouped by area and priority. Line numbers reflect the state at review time and may drift.

Notes on intentional decisions (flagged by reviewers but kept on purpose):
- Footer dropped the Categories/Contact columns — intentional per design direction.
- Cormorant Garamond (display) + Inter (body) — intentional per the brief.
- View-count inflation / rate-limiting — out of scope (no DoS hardening for v1).

---

## Code Correctness

### P0
- [ ] **Tag filter is a no-op in production.** `lib/data/posts.ts` (`getPosts`) only applies `tagSlug` in the mock branch; the Supabase `posts_public` and search branches ignore it, so `/blogs?tag=…` and the FilterBar tag dropdown do nothing when Supabase is configured. Resolve tag → id and constrain via `post_tags`; apply in the search branch too.

### P1
- [ ] **Search pagination/count wrong + tag ignored.** `lib/data/posts.ts` search branch uses `search_posts` RPC (`LIMIT 50`); `total` is computed from ≤50 rows so pagination and the "{total} posts" count are wrong for >50 matches, and category is filtered in-memory after the cap. Push category/tag into the query before the limit, or count separately.
- [ ] **`sanitize-html` + `@tiptap/html` shipped to the client bundle.** `components/admin/PostPreview.tsx` is `"use client"` and imports `lib/tiptap/render.ts`, pulling heavy Node-oriented `sanitize-html` into the browser. Render preview HTML server-side (server action/component) and pass the sanitized string down.
- [ ] **Like toggle read-modify-write race.** `lib/actions/engagement.ts` `toggleLike` does SELECT then INSERT/DELETE with no atomicity; double clicks can both insert (unique-violation only `console.error`'d) and desync the UI. Use upsert `on conflict do nothing` for like, check delete row count for unlike, derive `liked` from the post-mutation state.
- [ ] **Silent error swallowing across data layer.** `lib/data/posts.ts` and `lib/data/admin.ts` destructure only `{data}`/`{count}`, never `error`; RLS rejections/outages render as empty/404 indistinguishable from "no content". Capture + log `error`, surface a distinct error state (or throw to the error boundary).

### P2
- [ ] Preview reading-time duplicates `readingTimeFrom` (`components/admin/PostPreview.tsx` vs `lib/actions/admin.ts`) — extract a shared `lib/tiptap/reading-time.ts`.
- [ ] `getCurrentUser` (`lib/auth.ts`) re-queries the profile role per request; middleware already fetched it. Wrap in `React.cache` for the request.
- [ ] `getEditablePost` (`lib/data/admin.ts`) uses `.single()` (noisy error on missing id) vs the `.maybeSingle()` convention elsewhere.
- [x] `getLatestPosts` / `getFeaturedPost` confirmed still referenced (landing page) — not dead.

---

## Frontend / UI-UX

### P0
- [ ] **Gold glyphs/text on parchment fail contrast (~1.9:1).** `text-gold` decorative icons on light surfaces are nearly invisible: gate Lock `app/(public)/blogs/[slug]/page.tsx`, Featured pull-quote `app/(public)/page.tsx`, About quote `app/(public)/about/page.tsx`. Use `gold-700` (~4.7:1) for gold glyphs on ivory/parchment; reserve `gold`/`gold-400` for the maroon panels.
- [ ] **Custom Select is not keyboard-operable.** `components/public/Select.tsx` — no Arrow/Home/End/Enter/type-ahead, no roving focus/`aria-activedescendant`. Add keyboard handling + focus management (or layer a native `<select>`). It's the primary `/blogs` filter control.
- [ ] **Destructive delete has no confirmation.** `app/(admin)/admin/posts/page.tsx` (and other admin lists) delete on a single submit. Add a confirm step (at least `confirm()`), ideally an Undo toast.
- [ ] **Mobile admin drawer is a partial modal.** `components/admin/AdminSidebar.tsx` — no focus trap, no Escape, no body-scroll lock; Tab escapes behind the scrim. Add `role="dialog" aria-modal`, focus the close button on open, trap Tab, Escape to close, lock body scroll.

### P1
- [ ] Sub-44px touch targets: admin edit/delete `h-8 w-8` (`app/(admin)/admin/posts/page.tsx`), pagination `h-9 w-9` (`components/public/Pagination.tsx`). Expand tap area to ~44px on mobile.
- [ ] `gold-400` on maroon (~4.0:1) fails AA for small text: rail "View all posts" `text-xs` (`app/(public)/page.tsx`), admin active nav label (`components/admin/AdminSidebar.tsx`), newsletter success (`components/public/NewsletterForm.tsx`). Use a lighter gold or ivory for small text on maroon.
- [ ] iOS input zoom: 14px inputs auto-zoom on focus. Set mobile input font-size ≥16px in header search, FilterBar, Newsletter, Auth/Contact forms.
- [ ] Heading hierarchy: two identical `h2` "Latest Posts" on the landing; post-detail sidebar `h3`s precede any main-column `h2`. Dedupe labels / reorder.
- [ ] `background-attachment: fixed` on the body pattern (`app/globals.css`) is janky/disabled on iOS Safari. Use `scroll` or gate behind `@media (hover:hover)`.

### P2
- [ ] Footer social links are dead `href="#"` (`components/public/SiteFooter.tsx`) — disable or point to real profiles.
- [ ] Select option labels don't truncate (long tag names could overflow) — add `truncate`.
- [ ] No scroll-to-top on filter/pagination change (`components/public/FilterBar.tsx`) — user can land mid-page after paginating deep.
- [ ] Consider `loading.tsx` skeletons for slower data routes.
- [ ] Optional: warmer humanist body face (Spectral/Source Serif/Newsreader) instead of Inter for more editorial distinctiveness.

---

## Security (all Low / hardening — no Critical/High found)

The registration wall, admin authorization, XSS sanitization (both the public render and PostPreview), security-definer functions, and storage policies are all correctly enforced at the DB (RLS) with server-side defense-in-depth.

- [ ] **View-count inflation.** `increment_post_view` is `security definer`, granted to `anon`, and `recordView` (`lib/actions/engagement.ts`) takes an arbitrary slug — anyone can script `+1`s. Integrity-only; accept or add session-keyed dedup.
- [ ] **Uploaded filename used verbatim in the storage key.** `components/admin/MediaUploader.tsx` only normalizes whitespace; sanitize to a safe basename or use a UUID. Admin-only, no traversal outside the bucket.
- [ ] **Brittleness note:** `getPostContent` relies solely on the `posts` SELECT policy staying `to authenticated`. Keep it; consider a regression test asserting anon gets 0 rows from `posts`.
