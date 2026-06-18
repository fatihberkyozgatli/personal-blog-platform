create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

drop policy if exists site_settings_select on site_settings;
create policy site_settings_select on site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists site_settings_write on site_settings;
create policy site_settings_write on site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on site_settings to anon, authenticated;
grant insert, update on site_settings to authenticated;
