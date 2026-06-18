import { vi } from "vitest";

export type Result = { data?: unknown; error?: unknown; count?: number };

export function makeQuery(result: Result = { data: null, error: null }) {
  const q: Record<string, unknown> = {};
  for (const m of ["select", "eq", "neq", "in", "order", "range", "limit", "match", "is"]) {
    q[m] = vi.fn(() => q);
  }
  q.maybeSingle = vi.fn(async () => result);
  q.single = vi.fn(async () => result);
  q.insert = vi.fn(async () => result);
  q.upsert = vi.fn(async () => result);
  q.update = vi.fn(() => q);
  q.delete = vi.fn(() => q);
  (q as { then: unknown }).then = (resolve: (r: Result) => unknown) => resolve(result);
  return q;
}

export function makeSupabase(
  tableResults: Record<string, Result> = {},
  rpcResult: Result = { data: null, error: null },
) {
  const calls: { table: string }[] = [];
  const queries: { table: string; query: ReturnType<typeof makeQuery> }[] = [];
  const client = {
    from: vi.fn((table: string) => {
      calls.push({ table });
      const query = makeQuery(tableResults[table] ?? { data: null, error: null });
      queries.push({ table, query });
      return query;
    }),
    rpc: vi.fn(async () => rpcResult),
    auth: {
      signInWithPassword: vi.fn(async () => ({ data: { user: null }, error: null })),
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
  };
  return { client, calls, queries };
}
