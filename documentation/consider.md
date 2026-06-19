# Placeholder Name: Consider Later

Things intentionally deferred out of the core v1 stages. Revisit when relevant.

## Auth / accounts
- **Profile editing** — let readers change their display name / avatar. Not in v1.

## Email / delivery
- **Custom SMTP** — Supabase's built-in email service is for testing only and tightly
  rate-limited (a few messages/hour); repeated signups hit `email rate limit exceeded`. Before
  production, configure a real SMTP provider (Resend, SendGrid, Postmark, SES) under Supabase →
  Authentication → SMTP. For local testing you can also turn off "Confirm email" or raise the
  email rate limit in the dashboard.

## UI polish
- **About quote frame too small for short quotes** — the `ArchFrame` around the favourite quote
  (`components/public/AboutView.tsx`) sizes to its content, so a short quote leaves the arch squat
  on desktop. Give the frame a responsive `min-h` (e.g. `min-h-[16rem] sm:min-h-[20rem]`) and
  vertically centre the content.
