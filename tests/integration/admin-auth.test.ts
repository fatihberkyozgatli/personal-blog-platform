import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabase } from "../helpers/mock-supabase";
import type { Role } from "@/lib/data/types";

type UserShape = { id: string; email: string; displayName: string; role: Role };

const supabaseConfigured = vi.fn(() => true);
const currentUser = vi.fn(async (): Promise<UserShape> => ({ id: "u1", email: "a@b.com", displayName: "A", role: "reader" }));
let mock = makeSupabase();

vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => supabaseConfigured() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => mock.client }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: () => currentUser() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => ({ get: vi.fn(() => null) })) }));

import { savePost, createCategory } from "@/lib/actions/admin";
import { signIn } from "@/app/(auth)/actions";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

beforeEach(() => {
  mock = makeSupabase();
  supabaseConfigured.mockReturnValue(true);
  currentUser.mockResolvedValue({ id: "u1", email: "a@b.com", displayName: "A", role: "reader" });
});

describe("savePost", () => {
  it("returns not-authorized for a reader and never queries posts", async () => {
    const res = await savePost({ ok: false, message: "" }, fd({
      title: "My Post",
      status: "draft",
      content: JSON.stringify({ type: "doc", content: [] }),
    }));
    expect(res.ok).toBe(false);
    expect(res.message).toBe("You are not authorized to do that.");
    expect(mock.calls.some((c) => c.table === "posts")).toBe(false);
  });
});

describe("createCategory", () => {
  it("returns not-authorized for a reader and never queries categories", async () => {
    const res = await createCategory({ ok: false, message: "" }, fd({ name: "Travel" }));
    expect(res.ok).toBe(false);
    expect(res.message).toBe("You are not authorized to do that.");
    expect(mock.calls.some((c) => c.table === "categories")).toBe(false);
  });
});

describe("signIn", () => {
  it("returns an error for an invalid email without calling supabase auth", async () => {
    const res = await signIn({}, fd({ email: "not-an-email", password: "validpassword" }));
    expect(res.error).toBeTruthy();
    expect(mock.client.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns an error for a short password without calling supabase auth", async () => {
    const res = await signIn({}, fd({ email: "user@example.com", password: "short" }));
    expect(res.error).toBeTruthy();
    expect(mock.client.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns an error for both invalid email and short password without calling supabase auth", async () => {
    const res = await signIn({}, fd({ email: "bad", password: "bad" }));
    expect(res.error).toBe("Enter a valid email and a password of at least 8 characters.");
    expect(mock.client.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});
