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

import { sendMessage } from "@/lib/actions/contact";
import { subscribe } from "@/lib/actions/newsletter";
import { updateAbout } from "@/lib/actions/about";

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

describe("sendMessage", () => {
  it("inserts a valid contact message", async () => {
    const res = await sendMessage({ ok: false, message: "" }, fd({ name: "Ada", email: "a@b.com", body: "Hi there." }));
    expect(res.ok).toBe(true);
    expect(mock.calls.some((c) => c.table === "contact_messages")).toBe(true);
  });
  it("rejects an invalid email without touching the DB", async () => {
    const res = await sendMessage({ ok: false, message: "" }, fd({ name: "Ada", email: "nope", body: "Hi" }));
    expect(res.ok).toBe(false);
    expect(mock.calls.length).toBe(0);
  });
});

describe("subscribe", () => {
  it("treats a duplicate email (23505) as success", async () => {
    mock = makeSupabase({ newsletter_subscribers: { error: { code: "23505" } } });
    const res = await subscribe({ ok: false, message: "" }, fd({ email: "a@b.com" }));
    expect(res.ok).toBe(true);
  });
});

describe("updateAbout", () => {
  it("rejects a non-admin caller", async () => {
    currentUser.mockResolvedValue({ id: "u1", email: "a@b.com", displayName: "A", role: "reader" });
    const res = await updateAbout({ ok: false, message: "" }, fd({ name: "X" }));
    expect(res.ok).toBe(false);
    expect(mock.calls.some((c) => c.table === "site_settings")).toBe(false);
  });
  it("rejects an invalid payload shape for an admin", async () => {
    currentUser.mockResolvedValue({ id: "a1", email: "admin@b.com", displayName: "Admin", role: "admin" });
    const res = await updateAbout({ ok: false, message: "" }, fd({ name: "" }));
    expect(res.ok).toBe(false);
  });
});
