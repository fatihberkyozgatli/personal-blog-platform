import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabase } from "../helpers/mock-supabase";
import { setFeaturedPost } from "@/lib/actions/admin";

vi.mock("@/lib/auth", () => ({ getCurrentUser: () => currentUser() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const currentUser = vi.fn(async () => ({ id: "a1", email: "a@b.com", displayName: "A", role: "admin" as const }));

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

function fd(id: string) {
  const f = new FormData();
  f.set("id", id);
  return f;
}

describe("setFeaturedPost", () => {
  beforeEach(() => {
    currentUser.mockResolvedValue({ id: "a1", email: "a@b.com", displayName: "A", role: "admin" });
  });

  it("rejects a non-admin (no site_settings write)", async () => {
    currentUser.mockResolvedValue({ id: "u1", email: "u@b.com", displayName: "U", role: "reader" as never });
    mock = makeSupabase();
    await setFeaturedPost(fd("p1"));
    expect(mock.calls.some((c) => c.table === "site_settings")).toBe(false);
  });

  it("refuses a non-published post", async () => {
    mock = makeSupabase({ posts: { data: { status: "draft" } } });
    await setFeaturedPost(fd("p1"));
    expect(mock.calls.some((c) => c.table === "site_settings")).toBe(false);
  });

  it("sets the featured id for a published post", async () => {
    mock = makeSupabase({
      posts: { data: { status: "published" } },
      site_settings: { data: { value: { post_id: null } } },
    });
    await setFeaturedPost(fd("p1"));
    const upsertCalls = mock.queries.filter(
      (q) => q.table === "site_settings" && (q.query.upsert as ReturnType<typeof vi.fn>).mock.calls.length > 0,
    );
    expect(upsertCalls.length).toBeGreaterThan(0);
    const args = (upsertCalls[0].query.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args).toMatchObject({ key: "featured_post", value: { post_id: "p1" } });
  });
});
