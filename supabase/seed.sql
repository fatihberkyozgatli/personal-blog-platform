insert into categories (name, slug, description) values
  ('Reflections', 'reflections', 'Personal reflections and contemplations.'),
  ('Faith', 'faith', 'Essays on faith and spirituality.'),
  ('History', 'history', 'Lessons and stories from history.'),
  ('Literature', 'literature', 'On books, poetry, and the written word.'),
  ('Society', 'society', 'Observations on society and culture.'),
  ('Personal Growth', 'personal-growth', 'Notes on growth and self-improvement.')
on conflict (slug) do nothing;

insert into tags (name, slug) values
  ('Patience', 'patience'), ('Memory', 'memory'), ('Gratitude', 'gratitude'),
  ('Mindfulness', 'mindfulness'), ('Empires', 'empires')
on conflict (slug) do nothing;

do $$
declare
  admin_id uuid;
  c_reflections uuid;
  c_history uuid;
  c_growth uuid;
  c_literature uuid;
  placeholder_body jsonb := '{"type":"doc","content":[
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"A placeholder section"}]},
    {"type":"paragraph","content":[{"type":"text","text":"Placeholder body text for development. Replace via the admin editor in Stage 4."}]},
    {"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"A placeholder quotation, to exercise blockquote styling."}]}]},
    {"type":"bulletList","content":[
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"First placeholder point."}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Second placeholder point."}]}]}
    ]}
  ]}'::jsonb;
begin
  select id into admin_id from profiles where role = 'admin' order by created_at limit 1;
  if admin_id is null then
    raise notice 'No admin profile found; skipping post seed. Promote the owner to admin, then re-run seed.sql.';
    return;
  end if;

  select id into c_reflections from categories where slug = 'reflections';
  select id into c_history from categories where slug = 'history';
  select id into c_growth from categories where slug = 'personal-growth';
  select id into c_literature from categories where slug = 'literature';

  insert into posts (title, slug, excerpt, content, status, published_at, reading_time, category_id, author_id) values
    ('The Beauty of Patience in a Restless World', 'the-beauty-of-patience-in-a-restless-world',
     'A placeholder reflection on patience amid the noise of modern life.', placeholder_body,
     'published', now() - interval '12 days', 4, c_reflections, admin_id),
    ('In the Footsteps of Forgotten Empires', 'in-the-footsteps-of-forgotten-empires',
     'A placeholder essay walking through the ruins of memory and history.', placeholder_body,
     'published', now() - interval '9 days', 6, c_history, admin_id),
    ('A Letter to My Younger Self', 'a-letter-to-my-younger-self',
     'A placeholder letter of advice across the years.', placeholder_body,
     'published', now() - interval '6 days', 3, c_growth, admin_id),
    ('Finding Meaning in the Everyday', 'finding-meaning-in-the-everyday',
     'A placeholder meditation on small moments and quiet significance.', placeholder_body,
     'published', now() - interval '3 days', 5, c_reflections, admin_id),
    ('Lessons from the Old Masters', 'lessons-from-the-old-masters',
     'A placeholder note on what literature teaches across centuries.', placeholder_body,
     'published', now() - interval '1 days', 5, c_literature, admin_id),
    ('A Draft Not Yet Published', 'a-draft-not-yet-published',
     'Placeholder draft excerpt.', placeholder_body,
     'draft', null, 2, c_reflections, admin_id),
    ('A Post Scheduled for the Future', 'a-post-scheduled-for-the-future',
     'Placeholder scheduled excerpt.', placeholder_body,
     'published', now() + interval '30 days', 3, c_growth, admin_id)
  on conflict (slug) do nothing;
end $$;
