-- Add a per-category icon (a key from the curated set in lib/category-icons).
alter table categories add column if not exists icon text;

-- Seed sensible defaults for the existing categories.
update categories set icon = 'feather' where slug = 'reflections' and icon is null;
update categories set icon = 'flame'   where slug = 'faith' and icon is null;
update categories set icon = 'scroll'  where slug = 'history' and icon is null;
update categories set icon = 'book'    where slug = 'literature' and icon is null;
update categories set icon = 'users'   where slug = 'society' and icon is null;
update categories set icon = 'sprout'  where slug = 'personal-growth' and icon is null;
