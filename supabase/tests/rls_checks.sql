begin;
set local role anon;
do $$
declare n int; safe_post_id uuid; leaked_content jsonb;
begin
  select id into safe_post_id from posts where status = 'published' and published_at <= now() limit 1;
  assert safe_post_id is not null, 'anon must be able to select safe columns for published posts';
  begin
    select content into leaked_content from posts limit 1;
    raise exception 'anon SELECT posts.content should have been blocked';
  exception when insufficient_privilege then
    null;
  end;
  select count(*) into n from posts_public;
  assert n >= 5, format('anon must see published posts via posts_public, saw %s', n);
  select count(*) into n from posts_public where slug in ('a-draft-not-yet-published','a-post-scheduled-for-the-future');
  assert n = 0, 'anon must NOT see draft or future posts via posts_public';
end $$;
insert into newsletter_subscribers (email) values ('rls-check-anon@example.com');
do $$
declare n int;
begin
  select count(*) into n from newsletter_subscribers;
  assert n = 0, format('anon must not read newsletter_subscribers, saw %s', n);
end $$;
rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}';
do $$
declare n int;
begin
  select count(*) into n from posts;
  assert n >= 5, format('reader must see published posts, saw %s', n);
  select count(*) into n from posts where status = 'draft' or published_at > now();
  assert n = 0, 'reader must NOT see drafts or future-dated posts';
end $$;
do $$
begin
  begin
    insert into posts (title, slug, excerpt, content, status, author_id)
    values ('hack','hack-slug','x','{}'::jsonb,'published','00000000-0000-0000-0000-000000000000');
    raise exception 'reader INSERT into posts should have been blocked';
  exception when insufficient_privilege or check_violation then
    null;
  end;
end $$;
rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"bcce1191-641d-4b28-a1fd-9e10f750ed6e","role":"authenticated"}';
do $$
declare n_draft int; n_future int;
begin
  select count(*) into n_draft from posts where status = 'draft';
  assert n_draft >= 1, 'admin must see drafts';
  select count(*) into n_future from posts where published_at > now();
  assert n_future >= 1, 'admin must see future-dated posts';
end $$;
do $$
declare n int;
begin
  select count(*) into n from newsletter_subscribers;
end $$;
rollback;

begin;
set local role anon;
insert into contact_messages (name, email, subject, body)
values ('rls-check', 'rls-check@example.com', 'rls', 'rls test body');
do $$
declare n int;
begin
  select count(*) into n from contact_messages;
  assert n = 0, format('anon must not read contact_messages, saw %s', n);
end $$;
do $$
declare n int;
begin
  select count(*) into n from site_settings where key = 'about';
  assert n >= 0, 'anon SELECT on site_settings must not raise';
end $$;
rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}';
do $$
declare n int;
begin
  begin
    update site_settings set value = value where key = 'about';
    get diagnostics n = row_count;
    assert n = 0, format('reader must not update site_settings, row_count was %s', n);
  exception when insufficient_privilege then
    null;
  end;
end $$;
rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"bcce1191-641d-4b28-a1fd-9e10f750ed6e","role":"authenticated"}';
do $$
declare n int;
begin
  update site_settings set updated_at = now() where key = 'about';
  get diagnostics n = row_count;
  assert n >= 0, 'admin update site_settings must not raise insufficient_privilege';
end $$;
rollback;

begin;
set local role anon;
do $$
begin
  begin
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('media', 'rls-check-' || gen_random_uuid()::text, null, '{}'::jsonb);
    raise exception 'anon INSERT into storage.objects must be blocked';
  exception when insufficient_privilege then
    null;
  end;
end $$;
rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}';
do $$
begin
  begin
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('media', 'rls-check-' || gen_random_uuid()::text, '00000000-0000-0000-0000-000000000000'::uuid, '{}'::jsonb);
    raise exception 'reader INSERT into storage.objects must be blocked';
  exception when insufficient_privilege then
    null;
  end;
end $$;
rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"bcce1191-641d-4b28-a1fd-9e10f750ed6e","role":"authenticated"}';
do $$
declare inserted_name text;
begin
  inserted_name := 'rls-check-' || gen_random_uuid()::text;
  insert into storage.objects (bucket_id, name, owner, metadata)
  values ('media', inserted_name, 'bcce1191-641d-4b28-a1fd-9e10f750ed6e'::uuid, '{}'::jsonb);
end $$;
rollback;
