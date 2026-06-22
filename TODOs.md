# TODOs — Launch / Handoff Backlog

Current source of truth for remaining work. Open items stay at the top; completed review findings are archived below.

## Open

### Client Content / Handoff
- [ ] **Contact page content.** `app/(public)/contact/page.tsx` still shows placeholder `hello@placeholder.com` / `New York, USA`; replace with real values or remove.
- [ ] **Footer social links.** `components/public/SiteFooter.tsx` still has dead `href="#"` social links; replace with real profiles or remove them.

### Deferred UI / Polish
- [ ] **Small touch targets.** Some admin controls / pagination controls are still below the ideal 44px mobile target.
- [ ] **Small-text contrast on maroon.** Some `gold-400` small text on maroon surfaces is borderline; use lighter gold or ivory where needed.
- [ ] **Tiptap link/image prompts.** `TiptapEditor` still uses `window.prompt` for link/image insertion; replace with themed inline UI later.
- [ ] **Admin dashboard stat grid.** Seven stat cards feel orphaned in the current grid; polish layout later.
- [ ] **Basic monitoring/logging plan.** Vercel logs cover v1, but define how prod errors get surfaced post-launch.
- [ ] **Optional body-font exploration.** Inter is intentionally kept for now; a warmer body face can be explored later.

## Future Editorial Design Refinement

Not required for launch hardening. These are post-handoff visual/editorial upgrades to make the site feel more like a distinctive literary publication and less like a conventional blog.

Methodology: treat each refinement as a separate visual exploration rather than a direct merge into the product. For each item, create one or more short-lived `design/...` branches from the current `main`, implement only that option, capture local screenshots for client review, and push the branch as a reference. Do not merge or stack these experiments until a direction is chosen; keeping each option isolated makes comparison, rollback, and final selection straightforward.

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

---

## Completed

### Code Correctness
- [x] **Tag filter is a no-op in production.** Fixed in `lib/data/posts.ts` (Supabase + search branches); covered by `tests/integration/get-posts.test.ts`.
- [x] **Search pagination/count wrong + tag ignored.** Pagination/count verified correct (no cap in the `search_posts` RPC); search now also honors an explicit sort (`lib/data/posts.ts`); covered by `tests/integration/get-posts.test.ts`.
- [x] **Like toggle read-modify-write race.** Fixed in `lib/actions/engagement.ts` (delete-returning + upsert); covered by `tests/integration/toggle-like.test.ts`.
- [x] **Silent error swallowing across data layer.** Fixed in `lib/data/posts.ts` and `lib/data/admin.ts` (errors now logged).
- [x] Preview reading-time duplicates were extracted to shared `lib/tiptap/reading-time.ts`.
- [x] `getCurrentUser` is wrapped in `React.cache` for request-level reuse.
- [x] `getEditablePost` now uses `.maybeSingle()` instead of `.single()`.
- [x] `getLatestPosts` / `getFeaturedPost` confirmed still referenced by the landing page.
- [x] **Stale public post page after edit/delete.** `savePost`/`deletePost` now revalidate `/blogs/[slug]`.

### Security / Hardening
- [x] **Admin preview HTML sanitization.** Admin post/about previews now sanitize editor HTML with a lightweight browser allowlist before passing it to `dangerouslySetInnerHTML`, without shipping `sanitize-html` to the client.
- [x] **Host-header in `emailRedirectTo`.** Auth redirects now use the configured site URL.
- [x] **Basic bot/spam hardening on public writes.** Contact/newsletter/comment use honeypot + minimum submit time; view counts use cookie dedup.
- [x] **View-count inflation.** Session/cookie dedup added for v1 integrity.
- [x] **Uploaded filename used verbatim in storage key.** Media uploads now use a safe basename + UUID.
- [x] **Media MIME/size hardening.** Client validation plus bucket MIME/size migration added.
- [x] **`coverImage` validation.** Cover image URL must be valid HTTPS.
- [x] **`lib/data/admin.ts` reads defense-in-depth.** Admin layout guard added in addition to middleware/RLS.
- [x] **Security headers.** `next.config.mjs` adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
- [x] **`safeNext` `/@` edge case.** `/@` is blocked.
- [x] **RLS regression for post content.** RLS checks assert anon cannot read `posts.content`.

### Frontend / Accessibility
- [x] Gold glyphs/text on light surfaces changed to higher-contrast `gold-700` where needed.
- [x] Custom `Select` now supports keyboard navigation, typeahead, and truncation.
- [x] Destructive admin deletes now use themed confirmation modals.
- [x] Mobile admin drawer now behaves like a modal: dialog role, focus trap, Escape, scroll lock, focus return.
- [x] iOS input zoom fixed by using mobile `text-base` on form inputs.
- [x] Heading hierarchy duplicate on landing cleaned up.
- [x] Body pattern `background-attachment` changed away from fixed.
- [x] Filter/pagination interactions scroll back to top.
- [x] Themed `not-found.tsx`, `error.tsx`, and `loading.tsx` added.
- [x] Primary/global/input focus contrast fixes applied.
- [x] Mobile header search added.
- [x] `PostEditor` body label now passes `ariaLabel="Post body"` to `TiptapEditor`.
- [x] Form error states include icons, not color alone.
- [x] Mobile admin preview panels hidden for post/about editors; forms remain available for quick edits.
- [x] About admin mobile overflow fixed with `min-w-0` and safer timeline/editor layout.

### SEO / Launch Config
- [x] `app/robots.ts` added with `/admin` disallow and sitemap reference.
- [x] Favicon/app icon/default OG image added.
- [x] `openGraph.images` wired in root metadata.
- [x] RSS discovery link added via `alternates.types`.
- [x] `NEXT_PUBLIC_SITE_URL` set/validated for production and shared through `lib/site-url.ts`.
- [x] Supabase Auth redirect URLs configured for prod domain.
- [x] `app/manifest.ts` added.

### Content Decisions
- [x] Brand name set to **Pages from the Red Diary**.
- [x] Footer Categories/Contact columns intentionally dropped per design direction.
- [x] Cormorant Garamond + Inter intentionally kept per brief.
- [x] Tiptap toolbar buttons remain 36px as a global editor decision, not an About-only change.
