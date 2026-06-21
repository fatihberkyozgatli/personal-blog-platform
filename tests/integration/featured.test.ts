import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabase } from "../helpers/mock-supabase";

let mock = makeSupabase();
const supabaseConfigured = vi.fn(() => true);

vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => supabaseConfigured() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => mock.client }));

import { getFeaturedPostId, getFeaturedPost } from "@/lib/data/posts";

beforeEach(() => {
  mock = makeSupabase();
  supabaseConfigured.mockReturnValue(true);
});

describe("getFeaturedPostId", () => {
  it("returns the configured post_id", async () => {
    mock = makeSupabase({ site_settings: { data: { value: { post_id: "p1" } } } });
    expect(await getFeaturedPostId()).toBe("p1");
  });
  it("returns null when unset", async () => {
    mock = makeSupabase({ site_settings: { data: null } });
    expect(await getFeaturedPostId()).toBeNull();
  });
  it("returns null when post_id is null", async () => {
    mock = makeSupabase({ site_settings: { data: { value: { post_id: null } } } });
    expect(await getFeaturedPostId()).toBeNull();
  });
});

describe("getFeaturedPost", () => {
  const row = { id: "p1", title: "Featured", slug: "featured", excerpt: "x", author_name: "A", category_id: null, cover_image: null, published_at: "2026-01-01", reading_time: 3, view_count: 9 };

  it("returns the configured post when it is live", async () => {
    mock = makeSupabase({
      site_settings: { data: { value: { post_id: "p1" } } },
      categories: { data: [] },
      posts_public: { data: row },
    });
    const post = await getFeaturedPost();
    expect(post?.id).toBe("p1");
  });

  it("falls back to the popular query when nothing is featured", async () => {
    const popular = { ...row, id: "pop", slug: "pop" };
    mock = makeSupabase({
      site_settings: { data: { value: { post_id: null } } },
      categories: { data: [] },
      posts_public: { data: [popular], count: 1 },
    });
    const post = await getFeaturedPost();
    expect(post?.id).toBe("pop");
  });
});
