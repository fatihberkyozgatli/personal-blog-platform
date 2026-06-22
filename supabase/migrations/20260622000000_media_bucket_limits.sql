do $$
begin
  if not exists (select 1 from storage.buckets where id = 'media') then
    raise exception 'media bucket not found; apply 20260617120000_media_storage.sql first';
  end if;
end $$;

update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    file_size_limit = 5242880
where id = 'media';
