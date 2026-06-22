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
- [ ] **Admin post preview HTML is not sanitized.** The heavy `sanitize-html` client-bundle issue is fixed, but `components/admin/PostPreview.tsx` still renders editor-provided HTML with `dangerouslySetInnerHTML`. Sanitize preview HTML without shipping the Node-oriented sanitizer back to the browser.
  - **Note:** public post rendering remains server-sanitized; this is an admin-preview self-XSS hardening item.
- [x] **Like toggle read-modify-write race.** Fixed in `lib/actions/engagement.ts` (delete-returning + upsert); covered by `tests/integration/toggle-like.test.ts`.
- [x] **Silent error swallowing across data layer.** Fixed in `lib/data/posts.ts` and `lib/data/admin.ts` (errors now logged).

### P2
- [x] Preview reading-time duplicates `readingTimeFrom` (`components/admin/PostPreview.tsx` vs `lib/actions/admin.ts`) — extract a shared `lib/tiptap/reading-time.ts`.
- [x] `getCurrentUser` (`lib/auth.ts`) re-queries the profile role per request; middleware already fetched it. Wrap in `React.cache` for the request.
- [x] `getEditablePost` (`lib/data/admin.ts`) uses `.single()` (noisy error on missing id) vs the `.maybeSingle()` convention elsewhere.
- [x] `getLatestPosts` / `getFeaturedPost` confirmed still referenced (landing page) — not dead.

---

## Frontend / UI-UX

### P0
- [x] **Gold glyphs/text on parchment fail contrast (~1.9:1).** `text-gold` decorative icons on light surfaces are nearly invisible: gate Lock `app/(public)/blogs/[slug]/page.tsx`, Featured pull-quote `app/(public)/page.tsx`. Use `gold-700` (~4.7:1) for gold glyphs on ivory/parchment; reserve `gold`/`gold-400` for the maroon panels.
  - [x] **About quote** — resolved: the About page now uses `gold-700` for the pull-quote ornament.
- [x] **Custom Select is not keyboard-operable.** `components/public/Select.tsx` — no Arrow/Home/End/Enter/type-ahead, no roving focus/`aria-activedescendant`. Add keyboard handling + focus management (or layer a native `<select>`). It's the primary `/blogs` filter control.
- [x] **Destructive delete has no confirmation.** `app/(admin)/admin/posts/page.tsx` (and other admin lists) delete on a single submit. Add a confirm step (at least `confirm()`), ideally an Undo toast.
- [x] **Mobile admin drawer is a partial modal.** `components/admin/AdminSidebar.tsx` — no focus trap, no Escape, no body-scroll lock; Tab escapes behind the scrim. Add `role="dialog" aria-modal`, focus the close button on open, trap Tab, Escape to close, lock body scroll.

### P1
- [ ] Sub-44px touch targets: admin edit/delete `h-8 w-8` (`app/(admin)/admin/posts/page.tsx`), pagination `h-9 w-9` (`components/public/Pagination.tsx`). Expand tap area to ~44px on mobile.
- [ ] `gold-400` on maroon (~4.0:1) fails AA for small text: rail "View all posts" `text-xs` (`app/(public)/page.tsx`), admin active nav label (`components/admin/AdminSidebar.tsx`), newsletter success (`components/public/NewsletterForm.tsx`). Use a lighter gold or ivory for small text on maroon.
- [x] iOS input zoom: 14px inputs auto-zoom on focus. Set mobile input font-size ≥16px in header search, FilterBar, Newsletter, Auth/Contact forms.
- [x] Heading hierarchy: two identical `h2` "Latest Posts" on the landing; post-detail sidebar `h3`s precede any main-column `h2`. Dedupe labels / reorder.
- [x] `background-attachment: fixed` on the body pattern (`app/globals.css`) is janky/disabled on iOS Safari. Use `scroll` or gate behind `@media (hover:hover)`.

### P2
- [ ] Footer social links are dead `href="#"` (`components/public/SiteFooter.tsx`) — disable or point to real profiles.
- [x] Select option labels don't truncate (long tag names could overflow) — add `truncate`.
- [x] No scroll-to-top on filter/pagination change (`components/public/FilterBar.tsx`) — user can land mid-page after paginating deep.
- [x] Consider `loading.tsx` skeletons for slower data routes.
- [ ] Optional: warmer humanist body face (Spectral/Source Serif/Newsreader) instead of Inter for more editorial distinctiveness.

---

## Security (all Low / hardening — no Critical/High found)

The registration wall, admin authorization, XSS sanitization (both the public render and PostPreview), security-definer functions, and storage policies are all correctly enforced at the DB (RLS) with server-side defense-in-depth.

- [ ] **View-count inflation.** `increment_post_view` is `security definer`, granted to `anon`, and `recordView` (`lib/actions/engagement.ts`) takes an arbitrary slug — anyone can script `+1`s. Integrity-only; accept or add session-keyed dedup.
- [x] **Uploaded filename used verbatim in the storage key.** `components/admin/MediaUploader.tsx` only normalizes whitespace; sanitize to a safe basename or use a UUID. Admin-only, no traversal outside the bucket.
- [ ] **Brittleness note:** `getPostContent` relies solely on the `posts` SELECT policy staying `to authenticated`. Keep it; consider a regression test asserting anon gets 0 rows from `posts`.

---

## Handoff Review (2026-06-21)

Whole-codebase code / security / UI-UX gate before client handoff. The reading wall, admin gating, and "no service-role key" were re-confirmed sound. New items only (findings already listed above are not repeated):

### Code
- [x] **Stale public post page after edit/delete.** `savePost`/`deletePost` (`lib/actions/admin.ts`) revalidate `/admin/posts` + `/blogs` but not `/blogs/[slug]`, so an edited/deleted post serves stale content to visitors. Add `revalidatePath("/blogs/[slug]", "page")`.

### Security (Low/Medium — no Critical/High)
- [x] **Host-header in `emailRedirectTo`.** `signUp`/`requestPasswordReset` (`app/(auth)/actions.ts`) build the redirect from the request `Origin` header. Largely mitigated by the Supabase redirect-URL allowlist; for defense-in-depth use `NEXT_PUBLIC_SITE_URL`.
- [ ] **No rate-limiting on public writes** (contact / newsletter / comment / `recordView`) — spam risk; needs edge middleware (Vercel/Upstash) or Turnstile.
- [x] **`coverImage` not validated** — `postSchema.coverImage` accepts any string; mirror `aboutSchema.portraitUrl` (`.url()` + https).
- [x] **Media MIME not validated server-side** — `MediaUploader` trusts client `file.type`; the bucket is public → SVG-with-script risk. Add a server check + bucket MIME/size limits.
- [x] **`lib/data/admin.ts` reads lack an `ensureAdmin()` guard** — rely on middleware + RLS only; add for defense-in-depth.
- [x] **No security headers** in `next.config.mjs` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy; CSP later).
- [x] **`safeNext` does not block `/@`** (`lib/utils/redirect.ts`) — edge-case open redirect on some proxies.

### UI / UX (a11y)
- [x] **Primary button hover contrast fails** (`components/shared/Button.tsx` — `gold-600` + ivory ≈ 3.05:1). Keep `text-ink` on hover or use maroon.
- [x] **Global focus outline fails 3:1** (`app/globals.css` — gold on ivory ≈ 2.1:1). Use maroon/persian.
- [x] **Input focus border fails 3:1** — all `focus:border-gold` inputs; use `focus:ring-maroon` like the auth forms.
- [x] **No mobile header search** — `components/public/SiteHeader.tsx` search is desktop-only (`md:`+).
- [x] **PostEditor "Body" label not associated** — pass `ariaLabel="Post body"` to `TiptapEditor`.
- [ ] **`window.prompt` for Tiptap link/image** (`TiptapEditor`) — unthemed system dialogs remain for editor link/image insertion; replace with inline UI / modal. Media delete confirmation is already modalized.
- [ ] Admin dashboard: 7 stat cards orphan in a 4-col grid (`app/(admin)/admin/page.tsx`).
- [x] Form error state is color-only (`text-clay`) — add an icon beside the message.

### Client-handoff content (needs the client's input)
- [x] **Brand name** set to **"Pages from the Red Diary"** (client-confirmed 2026-06-21) — hardcoded in `lib/site.ts` (`SITE_NAME`); flows to the header wordmark (`Logo`), footer copyright, `layout` metadata, and RSS feed.
- [ ] **Contact page** shows placeholder `hello@placeholder.com` / "New York, USA" (`app/(public)/contact/page.tsx`) — real values or remove. (Footer social links already noted under Frontend P2.)

---

## Launch Readiness & Pre-Handoff Plan (2026-06-22)

Owner-reviewed scope and priority. Implementation deferred ("sonra yapalım") — this is the agreed plan. Items already detailed above are cross-referenced (e.g. `[Handoff Review → Security]`), not duplicated; genuinely new items get their own checkbox here.

### Must do before deploy / handoff

**SEO / discoverability (new)**
- [x] **`app/robots.ts`** — robots route: allow public, `Disallow: /admin`, point to the existing `app/sitemap.ts`.
- [x] **Favicon + app icon + default OG image** — `public/` currently holds only fonts + ornaments. Add `app/favicon.ico` (or `app/icon.png`) and a branded default OG image (`app/opengraph-image.*` or a static asset). Stops the site looking "placeholder/dev"; the OG image matters most when links are shared.
- [ ] **Default `openGraph.images`** in `app/layout.tsx` metadata — wire the OG image above as the site-wide fallback share image.
- [x] **RSS discovery link** — add `alternates.types` (`{ "application/rss+xml": "/feed.xml" }`) to root metadata so browsers/readers auto-discover the existing RSS route.

**Deployment / config (new)**
- [ ] **`NEXT_PUBLIC_SITE_URL` set in Vercel (prod) + redeploy** — `app/layout.tsx` (`metadataBase`), `app/sitemap.ts`, and `app/feed.xml` fall back to `http://localhost:3000`. Unset in prod ⇒ canonical/OG/sitemap/RSS all point to localhost.
- [ ] **Validate `NEXT_PUBLIC_SITE_URL` in `lib/env.ts`** — add it to the Zod schema so a missing/invalid prod URL fails fast at startup instead of silently using the localhost fallback.
- [ ] **Supabase Auth redirect URLs for the prod domain** — dashboard → Authentication → URL Configuration: Site URL + `https://<domain>/auth/callback` (+ `/**`); keep `localhost:3000` for dev. (Pairs with the token_hash email-template change for cross-browser confirm/reset.)

**Already tracked above — confirmed do-now**
- [x] Security headers in `next.config.mjs` — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, optionally Permissions-Policy. `[Handoff Review → Security]`
- [x] `coverImage` URL validation. `[Handoff Review → Security]`
- [x] Media filename + MIME validation. `[Security → filename]` + `[Handoff Review → Security]`
- [x] revalidate `/blogs/[slug]` on save/delete. `[Handoff Review → Code]`
- [x] Destructive delete confirmation. `[Frontend P0]`
- [x] Select keyboard operability. `[Frontend P0]`
- [x] Contrast / focus fixes — button hover, focus outline, input border. `[Handoff Review → UI]`
- [x] Mobile header search. `[Handoff Review → UI]`
- [ ] Contact email + location real values. `[Client content]` · Footer social real URLs or remove. `[Frontend P2]`

### Nice to have (not deploy-blocking)
- [x] Themed `app/not-found.tsx` + `app/error.tsx` (+ `loading.tsx`) — default Next.js screens look broken on a demo/handoff. (`loading.tsx` skeletons also noted in `[Frontend P2]`.)
- [ ] `window.prompt` for Tiptap link/image → themed inline UI. Polish; destructive delete confirmations are already modalized. `[Handoff Review → UI]`
- [x] `app/manifest.ts` (PWA manifest) — optional; pairs with the app icon once it exists.
- [ ] Basic monitoring/logging plan — Vercel logs cover v1, but define how prod errors get surfaced post-launch.
- [ ] Rate limiting / Captcha on contact + newsletter — spam risk while public. `[Handoff Review → Security]`

---

## Future Editorial Design Refinement

Not required for launch hardening. These are post-handoff visual/editorial upgrades to make the site feel more like a distinctive literary publication and less like a conventional blog.

### Phase A
- [ ] **Issue: Pattern overload.** The wallpaper pattern appears globally, so the eye gets fewer quiet surfaces to rest on.
  - **Fix:** Remove the global body wallpaper. Use pattern only in selected editorial moments, such as the homepage hero, footer, or one feature band per page. Keep normal reading/content sections plain ivory or parchment. If pattern is used, reduce opacity by 40-60% from the current level.

- [ ] **Issue: Author card is generic.** "The Author" and broad descriptive text do not carry much personality.
  - **Fix:** Replace the generic author card with a personal author module powered by About data: real name, short description, location, currently reading, and currently writing. Do not add lifestyle-style fields such as drinking, favorite tea, or favorite flower; keep the module literary and restrained.

- [ ] **Issue: Homepage hero copy is beautiful but generic.** "Thoughts from the Heart, Stories from the Soul" could belong to many personal blogs.
  - **Fix:** Replace it with copy only this site could say, tied to faith, literature, memory, place, and becoming. Prefer concrete, personal phrasing over abstract inspirational language. Keep the headline short enough to preserve the current hero composition.

### Phase B
- [ ] **Issue: Article pages are functional but not memorable.** The current flow is title, large image, text, comments; it works, but it reads closer to a polished blog template than a literary journal.
  - **Fix:** Rework the article layout around an editorial essay rhythm: compact date/category line, expressive title, excerpt as subtitle, narrower reading column, essay body, manuscript-style pull quote treatment, related entries, and a subtle gold reading-progress line if it stays restrained. Avoid ornament stacking: within a viewport, use at most one hero element, one ornament, and one accent color.
