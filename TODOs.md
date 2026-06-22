# TODOs — Review Findings

Consolidated from a three-way review (code correctness · frontend/UI-UX · security) run on the current branch. Items are grouped by area and priority. Line numbers reflect the state at review time and may drift.

Notes on intentional decisions (flagged by reviewers but kept on purpose):
- Footer dropped the Categories/Contact columns — intentional per design direction.
- Cormorant Garamond (display) + Inter (body) — intentional per the brief.
- View-count inflation / rate-limiting — out of scope (no DoS hardening for v1).
- Preview pane `py-16` padding — intentional; the admin live preview reuses `AboutView` directly so its format exactly matches the live site.
- Tiptap toolbar buttons are 36px (`h-9 w-9`) — pre-existing size shared with the post editor; should be revisited globally rather than changed only in the About feature.
- `getAboutContent()` could be wrapped in `React.cache` if a second same-request caller is ever added; currently only one call site, so no duplicate query.

---

## Code Correctness

### P0
- [x] **Tag filter is a no-op in production.** Fixed in `lib/data/posts.ts` (Supabase + search branches); covered by `tests/integration/get-posts.test.ts`.

### P1
- [x] **Search pagination/count wrong + tag ignored.** Pagination/count verified correct (no cap in the `search_posts` RPC); search now also honors an explicit sort (`lib/data/posts.ts`); covered by `tests/integration/get-posts.test.ts`.
- [ ] **`sanitize-html` + `@tiptap/html` shipped to the client bundle.** `components/admin/PostPreview.tsx` is `"use client"` and imports `lib/tiptap/render.ts`, pulling heavy Node-oriented `sanitize-html` into the browser. Render preview HTML server-side (server action/component) and pass the sanitized string down.
  - **Note:** the About admin preview (`/admin/about`) avoids this pattern — it uses the Tiptap editor's own `getHTML()` for the live preview and seeds initial HTML server-side, so `sanitize-html` is never shipped to the client on that route.
- [x] **Like toggle read-modify-write race.** Fixed in `lib/actions/engagement.ts` (delete-returning + upsert); covered by `tests/integration/toggle-like.test.ts`.
- [x] **Silent error swallowing across data layer.** Fixed in `lib/data/posts.ts` and `lib/data/admin.ts` (errors now logged).

### P2
- [ ] Preview reading-time duplicates `readingTimeFrom` (`components/admin/PostPreview.tsx` vs `lib/actions/admin.ts`) — extract a shared `lib/tiptap/reading-time.ts`.
- [ ] `getCurrentUser` (`lib/auth.ts`) re-queries the profile role per request; middleware already fetched it. Wrap in `React.cache` for the request.
- [ ] `getEditablePost` (`lib/data/admin.ts`) uses `.single()` (noisy error on missing id) vs the `.maybeSingle()` convention elsewhere.
- [x] `getLatestPosts` / `getFeaturedPost` confirmed still referenced (landing page) — not dead.

---

## Frontend / UI-UX

### P0
- [ ] **Gold glyphs/text on parchment fail contrast (~1.9:1).** `text-gold` decorative icons on light surfaces are nearly invisible: gate Lock `app/(public)/blogs/[slug]/page.tsx`, Featured pull-quote `app/(public)/page.tsx`. Use `gold-700` (~4.7:1) for gold glyphs on ivory/parchment; reserve `gold`/`gold-400` for the maroon panels.
  - [x] **About quote** — resolved: the About page now uses `gold-700` for the pull-quote ornament.
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

---

## Handoff Review (2026-06-21)

Whole-codebase code / security / UI-UX gate before client handoff. The reading wall, admin gating, and "no service-role key" were re-confirmed sound. New items only (findings already listed above are not repeated):

### Code
- [ ] **Stale public post page after edit/delete.** `savePost`/`deletePost` (`lib/actions/admin.ts`) revalidate `/admin/posts` + `/blogs` but not `/blogs/[slug]`, so an edited/deleted post serves stale content to visitors. Add `revalidatePath("/blogs/[slug]", "page")`.

### Security (Low/Medium — no Critical/High)
- [ ] **Host-header in `emailRedirectTo`.** `signUp`/`requestPasswordReset` (`app/(auth)/actions.ts`) build the redirect from the request `Origin` header. Largely mitigated by the Supabase redirect-URL allowlist; for defense-in-depth use `NEXT_PUBLIC_SITE_URL`.
- [ ] **No rate-limiting on public writes** (contact / newsletter / comment / `recordView`) — spam risk; needs edge middleware (Vercel/Upstash) or Turnstile.
- [ ] **`coverImage` not validated** — `postSchema.coverImage` accepts any string; mirror `aboutSchema.portraitUrl` (`.url()` + https).
- [ ] **Media MIME not validated server-side** — `MediaUploader` trusts client `file.type`; the bucket is public → SVG-with-script risk. Add a server check + bucket MIME/size limits.
- [ ] **`lib/data/admin.ts` reads lack an `ensureAdmin()` guard** — rely on middleware + RLS only; add for defense-in-depth.
- [ ] **No security headers** in `next.config.mjs` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy; CSP later).
- [ ] **`safeNext` does not block `/@`** (`lib/utils/redirect.ts`) — edge-case open redirect on some proxies.

### UI / UX (a11y)
- [ ] **Primary button hover contrast fails** (`components/shared/Button.tsx` — `gold-600` + ivory ≈ 3.05:1). Keep `text-ink` on hover or use maroon.
- [ ] **Global focus outline fails 3:1** (`app/globals.css` — gold on ivory ≈ 2.1:1). Use maroon/persian.
- [ ] **Input focus border fails 3:1** — all `focus:border-gold` inputs; use `focus:ring-maroon` like the auth forms.
- [ ] **No mobile header search** — `components/public/SiteHeader.tsx` search is desktop-only (`md:`+).
- [ ] **PostEditor "Body" label not associated** — pass `ariaLabel="Post body"` to `TiptapEditor`.
- [ ] **`window.prompt` / `window.confirm`** for Tiptap link/image + media delete (`TiptapEditor`, `MediaCard`) — unthemed system dialogs; replace with inline UI / modal.
- [ ] Admin dashboard: 7 stat cards orphan in a 4-col grid (`app/(admin)/admin/page.tsx`).
- [ ] Form error state is color-only (`text-clay`) — add an icon beside the message.

### Client-handoff content (needs the client's input)
- [x] **Brand name** set to **"Pages from the Red Diary"** (client-confirmed 2026-06-21) — hardcoded in `lib/site.ts` (`SITE_NAME`); flows to the header wordmark (`Logo`), footer copyright, `layout` metadata, and RSS feed.
- [ ] **Contact page** shows placeholder `hello@placeholder.com` / "New York, USA" (`app/(public)/contact/page.tsx`) — real values or remove. (Footer social links already noted under Frontend P2.)
