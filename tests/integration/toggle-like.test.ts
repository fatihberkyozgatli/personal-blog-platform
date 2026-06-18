import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabase } from "../helpers/mock-supabase";
import type { Role } from "@/lib/data/types";

type UserShape = { id: string; email: string; displayName: string; role: Role };

const supabaseConfigured = vi.fn(() => true);
const currentUser = vi.fn(async (): Promise<UserShape> => ({
  id: "user-1",
  email: "reader@test.com",
  displayName: "Reader",
  role: "reader",
}));
let mock = makeSupabase();

vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => supabaseConfigured() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => mock.client }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: () => currentUser() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { toggleLike } from "@/lib/actions/engagement";

beforeEach(() => {
  supabaseConfigured.mockReturnValue(true);
  currentUser.mockResolvedValue({
    id: "user-1",
    email: "reader@test.com",
    displayName: "Reader",
    role: "reader",
  });
});

describe("toggleLike — needsAuth guards", () => {
  it("returns needsAuth when supabase is not configured", async () => {
    supabaseConfigured.mockReturnValue(false);
    mock = makeSupabase();
    const result = await toggleLike("p1", "my-post");
    expect(result).toEqual({ liked: false, count: 0, needsAuth: true });
    expect(mock.calls.length).toBe(0);
  });

  it("returns needsAuth when no user is signed in", async () => {
    currentUser.mockResolvedValue(null as unknown as UserShape);
    mock = makeSupabase();
    const result = await toggleLike("p1", "my-post");
    expect(result).toEqual({ liked: false, count: 0, needsAuth: true });
    expect(mock.calls.length).toBe(0);
  });
});

describe("toggleLike — unlike path (delete returns a row)", () => {
  it("returns liked: false when delete removes an existing like", async () => {
    mock = makeSupabase({
      post_likes: { data: [{ post_id: "p1" }], error: null, count: 4 },
    });

    const result = await toggleLike("p1", "my-post");

    expect(result.liked).toBe(false);
    expect(result.count).toBe(4);
    expect(result.needsAuth).toBeUndefined();
  });

  it("does not call upsert when a row was deleted", async () => {
    mock = makeSupabase({
      post_likes: { data: [{ post_id: "p1" }], error: null, count: 2 },
    });

    await toggleLike("p1", "my-post");

    const postLikeQueries = mock.queries.filter((q) => q.table === "post_likes");
    const upsertCalled = postLikeQueries.some(
      (q) => (q.query.upsert as ReturnType<typeof vi.fn>).mock.calls.length > 0,
    );
    expect(upsertCalled).toBe(false);
  });
});

describe("toggleLike — like path (delete returns nothing)", () => {
  it("returns liked: true when no row existed to delete", async () => {
    mock = makeSupabase({
      post_likes: { data: [], error: null, count: 7 },
    });

    const result = await toggleLike("p1", "my-post");

    expect(result.liked).toBe(true);
    expect(result.count).toBe(7);
    expect(result.needsAuth).toBeUndefined();
  });

  it("calls upsert on post_likes when no existing like was found", async () => {
    mock = makeSupabase({
      post_likes: { data: [], error: null, count: 1 },
    });

    await toggleLike("p1", "my-post");

    const postLikeQueries = mock.queries.filter((q) => q.table === "post_likes");
    const upsertCalled = postLikeQueries.some(
      (q) => (q.query.upsert as ReturnType<typeof vi.fn>).mock.calls.length > 0,
    );
    expect(upsertCalled).toBe(true);
  });

  it("passes correct post_id and user_id to upsert", async () => {
    mock = makeSupabase({
      post_likes: { data: [], error: null, count: 1 },
    });

    await toggleLike("p1", "my-post");

    const postLikeQueries = mock.queries.filter((q) => q.table === "post_likes");
    const upsertQuery = postLikeQueries.find(
      (q) => (q.query.upsert as ReturnType<typeof vi.fn>).mock.calls.length > 0,
    );
    const upsertMock = upsertQuery!.query.upsert as ReturnType<typeof vi.fn>;
    expect(upsertMock.mock.calls[0][0]).toEqual({ post_id: "p1", user_id: "user-1" });
    expect(upsertMock.mock.calls[0][1]).toMatchObject({ onConflict: "post_id,user_id", ignoreDuplicates: true });
  });
});
