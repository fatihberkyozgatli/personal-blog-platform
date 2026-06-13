-- Placeholder Name — schema
-- See documentation/database.md for the rationale behind these tables.

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────
create type user_role   as enum ('admin', 'reader');
create type post_status as enum ('draft', 'published');

-- ── Profiles (extends auth.users) ────────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Reader',
  role         user_role not null default 'reader',
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Create a profile row automatically when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Categories & Tags ────────────────────────────────────────────────────
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text
);

create table tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- ── Posts ────────────────────────────────────────────────────────────────
create table posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  cover_image  text,
  excerpt      text not null default '',
  content      jsonb not null default '{}'::jsonb,
  status       post_status not null default 'draft',
  published_at timestamptz,
  reading_time int not null default 1,
  view_count   int not null default 0,
  category_id  uuid references categories (id) on delete set null,
  author_id    uuid not null references profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Full-text search vector over title + excerpt + content.
  search_tsv tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content::text, '')
    )
  ) stored
);

create index posts_status_published_idx on posts (status, published_at desc);
create index posts_category_idx on posts (category_id);
create index posts_search_idx on posts using gin (search_tsv);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

create table post_tags (
  post_id uuid not null references posts (id) on delete cascade,
  tag_id  uuid not null references tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ── Comments ─────────────────────────────────────────────────────────────
create table comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  parent_id  uuid references comments (id) on delete cascade,
  body       text not null,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_post_idx on comments (post_id, approved);

-- ── Likes (one per user per post) ────────────────────────────────────────
create table post_likes (
  post_id    uuid not null references posts (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ── Media library ────────────────────────────────────────────────────────
create table media (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  filename    text not null,
  mime_type   text not null,
  size        int not null default 0,
  width       int,
  height      int,
  uploaded_by uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Newsletter & Contact ─────────────────────────────────────────────────
create table newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Helpers ──────────────────────────────────────────────────────────────
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Public-safe view: card columns only, never `content`. Definer rights so anon
-- can read these columns even though they cannot read the base `posts` table.
create view posts_public
with (security_invoker = false) as
select
  p.id, p.title, p.slug, p.cover_image, p.excerpt,
  p.category_id, p.author_id, p.published_at, p.reading_time, p.view_count, p.created_at,
  pr.display_name as author_name
from posts p
join profiles pr on pr.id = p.author_id
where p.status = 'published' and p.published_at <= now();

grant select on posts_public to anon, authenticated;

-- Increment a post's view counter (any visitor; no UPDATE grant needed).
create or replace function increment_post_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update posts set view_count = view_count + 1
  where slug = p_slug and status = 'published' and published_at <= now();
$$;

-- Full-text search over published posts; returns safe columns only.
create or replace function search_posts(q text)
returns table (
  id uuid, title text, slug text, cover_image text, excerpt text,
  category_id uuid, author_id uuid, published_at timestamptz,
  reading_time int, view_count int, author_name text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id, p.title, p.slug, p.cover_image, p.excerpt,
    p.category_id, p.author_id, p.published_at, p.reading_time, p.view_count,
    pr.display_name
  from posts p
  join profiles pr on pr.id = p.author_id
  where p.status = 'published'
    and p.published_at <= now()
    and p.search_tsv @@ websearch_to_tsquery('simple', q)
  order by p.published_at desc
  limit 50;
$$;
