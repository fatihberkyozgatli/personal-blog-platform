alter view posts_public set (security_invoker = true);
alter view profiles_public set (security_invoker = true);

revoke select on posts from anon;
revoke select on profiles from anon;
revoke select on posts from authenticated;
revoke select on profiles from authenticated;

grant select (id, title, slug, cover_image, excerpt, status, category_id, author_id, published_at, reading_time, view_count, created_at) on posts to anon;
grant select on posts to authenticated;
grant select (id, display_name, avatar_url) on profiles to anon, authenticated;

create policy posts_select_published_anon on posts for select to anon
  using (status = 'published' and published_at <= now());

create policy profiles_select_public_anon on profiles for select to anon
  using (true);
create policy profiles_select_public_auth on profiles for select to authenticated
  using (true);

drop policy post_tags_select_all on post_tags;
create policy post_tags_select_public on post_tags for select to anon, authenticated
  using (
    is_admin() or exists (
      select 1 from posts
      where posts.id = post_tags.post_id
        and posts.status = 'published'
        and posts.published_at <= now()
    )
  );

drop policy post_likes_select_all on post_likes;
create policy post_likes_select_public on post_likes for select to anon, authenticated
  using (
    is_admin() or exists (
      select 1 from posts
      where posts.id = post_likes.post_id
        and posts.status = 'published'
        and posts.published_at <= now()
    )
  );

drop policy comments_select_anon on comments;
create policy comments_select_anon on comments for select to anon
  using (
    approved = true and exists (
      select 1 from posts
      where posts.id = comments.post_id
        and posts.status = 'published'
        and posts.published_at <= now()
    )
  );

drop policy comments_select_auth on comments;
create policy comments_select_auth on comments for select to authenticated
  using (
    is_admin()
    or user_id = auth.uid()
    or (
      approved = true and exists (
        select 1 from posts
        where posts.id = comments.post_id
          and posts.status = 'published'
          and posts.published_at <= now()
      )
    )
  );
