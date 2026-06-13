-- Placeholder Name — Row Level Security
-- Security is enforced here, at the database. See documentation/database.md §4.

alter table profiles               enable row level security;
alter table categories             enable row level security;
alter table tags                   enable row level security;
alter table posts                  enable row level security;
alter table post_tags              enable row level security;
alter table comments               enable row level security;
alter table post_likes             enable row level security;
alter table media                  enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_messages       enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────
create policy "profiles are readable" on profiles
  for select using (true);
create policy "users update own profile" on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "admins manage profiles" on profiles
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── posts (base table: anon has NO access; content is gated) ──────────────
create policy "readers see published posts" on posts
  for select to authenticated
  using ((status = 'published' and published_at <= now()) or is_admin());
create policy "admins manage posts" on posts
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── categories / tags / post_tags (public read, admin write) ──────────────
create policy "categories readable" on categories for select using (true);
create policy "admins manage categories" on categories
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "tags readable" on tags for select using (true);
create policy "admins manage tags" on tags
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "post_tags readable" on post_tags for select using (true);
create policy "admins manage post_tags" on post_tags
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── comments ─────────────────────────────────────────────────────────────
create policy "approved comments readable" on comments
  for select using (approved or auth.uid() = user_id or is_admin());
create policy "authed users add comments" on comments
  for insert to authenticated
  with check (user_id = auth.uid() and approved = false);
create policy "delete own or admin comments" on comments
  for delete to authenticated using (user_id = auth.uid() or is_admin());
create policy "admins moderate comments" on comments
  for update to authenticated using (is_admin()) with check (is_admin());

-- ── post_likes ───────────────────────────────────────────────────────────
create policy "likes readable" on post_likes for select using (true);
create policy "authed users like" on post_likes
  for insert to authenticated with check (user_id = auth.uid());
create policy "users remove own like" on post_likes
  for delete to authenticated using (user_id = auth.uid());

-- ── media (admin only) ───────────────────────────────────────────────────
create policy "admins manage media" on media
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── newsletter_subscribers (anyone subscribes; admin reads) ───────────────
create policy "anyone subscribes" on newsletter_subscribers
  for insert with check (true);
create policy "admins read subscribers" on newsletter_subscribers
  for select to authenticated using (is_admin());
create policy "admins delete subscribers" on newsletter_subscribers
  for delete to authenticated using (is_admin());

-- ── contact_messages (anyone sends; admin reads/updates) ──────────────────
create policy "anyone sends message" on contact_messages
  for insert with check (true);
create policy "admins read messages" on contact_messages
  for select to authenticated using (is_admin());
create policy "admins update messages" on contact_messages
  for update to authenticated using (is_admin()) with check (is_admin());

-- ── Function execution grants ─────────────────────────────────────────────
grant execute on function increment_post_view(text) to anon, authenticated;
grant execute on function search_posts(text) to anon, authenticated;
grant execute on function is_admin() to authenticated;
