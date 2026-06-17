create type user_role as enum ('admin', 'reader');
create type post_status as enum ('draft', 'published');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role user_role not null default 'reader',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_image text,
  excerpt text not null,
  content jsonb not null,
  status post_status not null default 'draft',
  published_at timestamptz,
  reading_time int not null default 0,
  view_count int not null default 0,
  category_id uuid references categories(id),
  author_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_status_published_at_idx on posts (status, published_at);
create index posts_category_id_idx on posts (category_id);

create table post_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id),
  parent_id uuid references comments(id) on delete cascade,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_post_id_idx on comments (post_id);

create table post_likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  mime_type text not null,
  size int not null,
  width int,
  height int,
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table posts add column search_tsv tsvector
  generated always as (
    to_tsvector('simple',
      coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content::text, ''))
  ) stored;
create index posts_search_idx on posts using gin (search_tsv);

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function increment_post_view(p_slug text) returns void
language sql security definer set search_path = public as $$
  update posts set view_count = view_count + 1
  where slug = p_slug and status = 'published' and published_at <= now();
$$;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

create view posts_public with (security_invoker = false) as
select
  p.id, p.title, p.slug, p.cover_image, p.excerpt,
  p.category_id, p.author_id, p.published_at, p.reading_time, p.view_count, p.created_at,
  pr.display_name as author_name
from posts p
join profiles pr on pr.id = p.author_id
where p.status = 'published' and p.published_at <= now();

create view profiles_public with (security_invoker = false) as
select id, display_name, avatar_url from profiles;

grant select on posts_public to anon, authenticated;
grant select on profiles_public to anon, authenticated;

create or replace function search_posts(q text) returns setof posts_public
language sql security definer stable set search_path = public as $$
  select pp.* from posts_public pp
  join posts p on p.id = pp.id
  where p.search_tsv @@ websearch_to_tsquery('simple', q);
$$;

grant execute on function is_admin() to anon, authenticated;
grant execute on function increment_post_view(text) to anon, authenticated;
grant execute on function search_posts(text) to anon, authenticated;

alter table profiles enable row level security;
alter table posts enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table post_tags enable row level security;
alter table comments enable row level security;
alter table post_likes enable row level security;
alter table media enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;

create policy profiles_select_own_or_admin on profiles for select to authenticated
  using (id = auth.uid() or is_admin());
create policy profiles_update_own on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on profiles for all to authenticated
  using (is_admin()) with check (is_admin());

create policy posts_select_published_or_admin on posts for select to authenticated
  using (is_admin() or (status = 'published' and published_at <= now()));
create policy posts_admin_write on posts for all to authenticated
  using (is_admin()) with check (is_admin());

create policy categories_select_all on categories for select to anon, authenticated using (true);
create policy categories_admin_all on categories for all to authenticated using (is_admin()) with check (is_admin());
create policy tags_select_all on tags for select to anon, authenticated using (true);
create policy tags_admin_all on tags for all to authenticated using (is_admin()) with check (is_admin());
create policy post_tags_select_all on post_tags for select to anon, authenticated using (true);
create policy post_tags_admin_all on post_tags for all to authenticated using (is_admin()) with check (is_admin());

create policy comments_select_anon on comments for select to anon using (approved = true);
create policy comments_select_auth on comments for select to authenticated
  using (approved = true or user_id = auth.uid() or is_admin());
create policy comments_insert_own on comments for insert to authenticated
  with check (user_id = auth.uid() and approved = false);
create policy comments_delete_own_or_admin on comments for delete to authenticated
  using (user_id = auth.uid() or is_admin());
create policy comments_admin_update on comments for update to authenticated
  using (is_admin()) with check (is_admin());

create policy post_likes_select_all on post_likes for select to anon, authenticated using (true);
create policy post_likes_insert_own on post_likes for insert to authenticated with check (user_id = auth.uid());
create policy post_likes_delete_own on post_likes for delete to authenticated using (user_id = auth.uid());
create policy post_likes_admin_all on post_likes for all to authenticated using (is_admin()) with check (is_admin());

create policy media_admin_all on media for all to authenticated using (is_admin()) with check (is_admin());

create policy newsletter_insert_anyone on newsletter_subscribers for insert to anon, authenticated with check (true);
create policy newsletter_admin_select on newsletter_subscribers for select to authenticated using (is_admin());
create policy newsletter_admin_delete on newsletter_subscribers for delete to authenticated using (is_admin());

create policy contact_insert_anyone on contact_messages for insert to anon, authenticated with check (true);
create policy contact_admin_select on contact_messages for select to authenticated using (is_admin());
create policy contact_admin_update on contact_messages for update to authenticated using (is_admin()) with check (is_admin());
