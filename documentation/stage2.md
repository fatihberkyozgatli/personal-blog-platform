# Placeholder Name: Stage 2 — Auth & Session

## Status: COMPLETED (2026-06-16)

Email/password auth (signup, login, signout), the email-confirmation callback, login/signup pages,
and the `/admin` route guard, all on the Stage 1 foundation. The review gate added: a `safeNext`
open-redirect validator (`lib/utils/redirect.ts`, tested) used by both redirect paths; an exact
`/admin` prefix match; explicit redirect cookie copying; a maroon focus ring (gold failed the 3:1
non-text contrast — corrected in `design.md`); 44px touch targets; and form a11y
(`aria-describedby`/`aria-invalid`, password helper text, required markers, focus-on-error,
`motion-safe` transitions). `display_name` derives from the email local-part (Stage 1 trigger);
password reset deferred (`consider.md`).

Verified: typecheck / lint / build clean; 8/8 unit tests. The live auth flow (signup → email
confirm → session; `/admin` redirects) is an owner test once the dashboard `/auth/callback`
redirect is configured.

---

> The second build stage from `stages.md`. Goal: real **email/password authentication** via
> Supabase Auth (email confirmation ON), plus the session plumbing the registration wall and the
> admin portal depend on. Builds directly on Stage 1 (the `profiles` auto-create trigger, RLS, the
> `is_admin()` function, and the session-refresh middleware already exist).

> **Naming:** use "Placeholder Name" until the client provides the real name.

Source docs: `architecture.md` §5 (Auth Flow), `database.md` (`profiles`, `is_admin`),
`design.md` (form styling), `stage1.md` (clients, middleware, RLS).

---

## 1. Scope

**In scope**
- `(auth)` route group: **login** and **signup** pages (Client Components — interactive forms).
- Email/password via **Supabase Auth, email confirmation ON**.
- **Auth callback** route (`app/auth/callback/route.ts`) to exchange the confirmation code for a session.
- **Sign-out** action.
- **Server Actions** for signup / login / signout, validated with **Zod** (`lib/validations/auth.ts`).
- **`/admin/*` guard** in middleware: non-admins (anon or reader) are redirected away; role checked
  via the `is_admin()` RPC under the user's session.
- Minimal auth UX: field errors, an "email not confirmed" state, a "check your email" message, redirects.

**Out of scope (later stages)**
- The site header's signed-in/out nav state (Stage 3 chrome).
- The reading-wall UI on the post page (Stage 3).
- Admin portal screens (Stage 4) — Stage 2 only adds the route guard.
- Password reset, OAuth providers, profile/account editing (deferred — see `consider.md`).

## 2. Prerequisites
- Stage 1 complete (Supabase clients, session-refresh middleware, RLS, `profiles` trigger, `is_admin()`).
- Supabase dashboard → Authentication → URL Configuration: add the confirmation redirect
  `http://localhost:3000/auth/callback` (and the production URL later). Email confirmation enabled.

## 3. Files
- Create: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` (Client Components).
- Create: `app/(auth)/actions.ts` (server actions: `signUp`, `signIn`, `signOut`).
- Create: `lib/validations/auth.ts` (Zod schemas) + `lib/validations/auth.test.ts`.
- Create: `app/auth/callback/route.ts` (code exchange → redirect).
- Modify: `lib/supabase/middleware.ts` (add the `/admin` role guard) — keep the reading wall OUT of middleware.
- Optional: `components/auth/auth-form.tsx` shared form (or keep inline per page).

## 4. Auth flow (`architecture.md` §5)
- **Signup:** form → `signUp` action → `supabase.auth.signUp({ email, password, options: { emailRedirectTo: <origin>/auth/callback } })`. Supabase emails a confirmation link; UI shows "check your email." The Stage 1 `handle_new_user` trigger creates the `profiles` row (`role = 'reader'`, `display_name` derived from the email local-part).
- **Confirm:** link → `/auth/callback?code=…` → route calls `supabase.auth.exchangeCodeForSession(code)` (sets the session cookie via `@supabase/ssr`) → redirect to the page the user came from (a `next` param), default `/`.
- **Login:** form → `signIn` action → `supabase.auth.signInWithPassword` → redirect to the `next` page (default `/`). Unconfirmed users get an "email not confirmed" error.
- `next` redirects must accept only relative paths like `/admin`; reject external URLs and
  protocol-relative values like `//evil.com`.
- **Logout:** `signOut` action → `supabase.auth.signOut()` → redirect to `/`.
- Session refresh: already handled by `middleware.ts` (Stage 1).

## 5. The `/admin` guard
In `lib/supabase/middleware.ts`, after `getUser()`:
- If the path is `/admin` or starts with `/admin/`:
  - no user → redirect `/login?next=<path>`;
  - user present → `supabase.rpc('is_admin')`; if `false` → redirect `/` (or a 403 page).
- `is_admin()` is `security definer` and uses `auth.uid()`, so it resolves for the current session;
  `execute` is already granted to `authenticated` (Stage 1). One extra DB round-trip per `/admin`
  request — acceptable for v1.

## 6. Validation (`lib/validations/auth.ts`)
- `credentialsSchema`: `email` = `z.string().email()`, `password` = `z.string().min(8)`.
- `signupSchema`: same as `credentialsSchema` for now — no display-name field; `display_name` is
  derived from the email local-part by the `handle_new_user` trigger (see `consider.md`).
- Server actions parse with these and return field errors to the form.

## 7. Design (`design.md`)
- Auth forms: parchment card on ivory, gold primary button ("Sign Up" / "Sign In"), maroon
  secondary, Playfair headings, Inter inputs, error text in `clay`, visible gold focus ring,
  accessible labels. Build the form UI with the **`ui-ux-pro-max`** skill.

## 8. Verification
- Unit: `auth.test.ts` — schemas reject bad email / short password, accept valid input.
- Manual: signup with a real test email → confirm → callback sets session → logged in; login &
  logout work; unconfirmed login is blocked; `/admin` redirects anon → `/login`, reader → `/`, and
  lets the Stage 1 owner (admin) through.
- `build` / `typecheck` / `lint` / `test` all green.

## 9. Resolved decisions
1. **Post-login/confirm redirect** — to the page the user came from (a `next` param), default `/`.
   No welcome page; in-app toasts/notifications are layered in separately.
2. **Sign-out** — add a `signOut` action in Stage 2 (it does not exist yet). A simple control is
   fine until the Stage 3 header carries it.
3. **Password reset** — deferred (see `consider.md`).
4. **Display name** — derived from the email local-part for now; no signup field (see `consider.md`).

## 10. Done when
- Signup → email confirmation → session works; login/logout work; unconfirmed users blocked.
- `/admin/*` guarded (anon → `/login`, reader → `/`, admin → through).
- Zod validation + unit tests green; `build` / `typecheck` / `lint` clean.

> Next: Stage 3 — Public Site & Registration Wall. Auth context: `architecture.md` §5.
