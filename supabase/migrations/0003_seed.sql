-- Placeholder Name — seed data + storage

-- Fixed category set from the design.
insert into categories (name, slug, description) values
  ('Reflections',     'reflections',     'Quiet thoughts on living well.'),
  ('Faith',           'faith',           'On belief, doubt, and devotion.'),
  ('History',         'history',         'Lessons from empires and eras past.'),
  ('Literature',      'literature',      'Words that have shaped us.'),
  ('Society',         'society',         'How we live together.'),
  ('Personal Growth', 'personal-growth', 'Becoming, slowly.')
on conflict (slug) do nothing;

-- Storage bucket for cover images and the media library.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read of media objects; only admins may write/delete.
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and is_admin());
create policy "admins update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and is_admin());
create policy "admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and is_admin());

-- ── After running migrations ──────────────────────────────────────────────
-- 1) Sign up through the app with the owner's email.
-- 2) Promote that account to admin (replace the UID):
--    update profiles set role = 'admin' where id = '<owner-auth-uid>';
