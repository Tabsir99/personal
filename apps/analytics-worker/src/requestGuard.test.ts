import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateAccess, resetOriginCache } from "./requestGuard";

function fakeKv(store: Record<string, string>) {
  const get = vi.fn(async (key: string) => store[key] ?? null);
  return { kv: { get } as unknown as KVNamespace, get };
}

const requestFrom = (origin: string) =>
  new Request("https://analytics.example.com/api/events", {
    method: "POST",
    headers: { Origin: origin },
  });

beforeEach(() => {
  resetOriginCache();
  vi.useRealTimers();
});

describe("validateAccess", () => {
  it("authorizes an origin listed in KV", async () => {
    const { kv } = fakeKv({ website_site1: '["https://site1.com"]' });
    const result = await validateAccess(
      requestFrom("https://site1.com"),
      "site1",
      kv,
    );
    expect(result.isAuthorized).toBe(true);
  });

  it("rejects an origin that is not listed", async () => {
    const { kv } = fakeKv({ website_site1: '["https://site1.com"]' });
    const result = await validateAccess(
      requestFrom("https://evil.com"),
      "site1",
      kv,
    );
    expect(result.isAuthorized).toBe(false);
  });

  it("honours a wildcard record", async () => {
    const { kv } = fakeKv({ website_site1: '["*"]' });
    const result = await validateAccess(
      requestFrom("https://anywhere.com"),
      "site1",
      kv,
    );
    expect(result.isAuthorized).toBe(true);
  });

  it("accepts a bare string record", async () => {
    const { kv } = fakeKv({ website_site1: "https://site1.com" });
    const result = await validateAccess(
      requestFrom("https://site1.com"),
      "site1",
      kv,
    );
    expect(result.isAuthorized).toBe(true);
  });

  it("reads KV once for repeated known lookups", async () => {
    const { kv, get } = fakeKv({ website_site1: '["https://site1.com"]' });
    for (let i = 0; i < 5; i++) {
      await validateAccess(requestFrom("https://site1.com"), "site1", kv);
    }
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("reads KV once for repeated unknown websiteIds", async () => {
    const { kv, get } = fakeKv({});
    for (let i = 0; i < 5; i++) {
      await validateAccess(requestFrom("https://site1.com"), "ghost", kv);
    }
    expect(get).toHaveBeenCalledTimes(1);
    expect(
      (await validateAccess(requestFrom("https://site1.com"), "ghost", kv))
        .isAuthorized,
    ).toBe(false);
  });

  it("re-reads a known record once its TTL lapses", async () => {
    vi.useFakeTimers();
    const { kv, get } = fakeKv({ website_site1: '["https://site1.com"]' });
    await validateAccess(requestFrom("https://site1.com"), "site1", kv);
    vi.advanceTimersByTime(61_000);
    await validateAccess(requestFrom("https://site1.com"), "site1", kv);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("re-reads an unknown record sooner than a known one", async () => {
    vi.useFakeTimers();
    const { kv, get } = fakeKv({});
    await validateAccess(requestFrom("https://site1.com"), "ghost", kv);
    vi.advanceTimersByTime(11_000);
    await validateAccess(requestFrom("https://site1.com"), "ghost", kv);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("picks up a website created after the negative lookup was cached", async () => {
    vi.useFakeTimers();
    const store: Record<string, string> = {};
    const { kv } = fakeKv(store);
    const req = () => requestFrom("https://new.com");

    expect((await validateAccess(req(), "fresh", kv)).isAuthorized).toBe(false);
    store.website_fresh = '["https://new.com"]';
    vi.advanceTimersByTime(11_000);
    expect((await validateAccess(req(), "fresh", kv)).isAuthorized).toBe(true);
  });

  it("evicts a single entry instead of flushing the whole cache", async () => {
    const store: Record<string, string> = {};
    for (let i = 0; i < 1001; i++) store[`website_s${i}`] = '["https://s.com"]';
    const { kv, get } = fakeKv(store);

    for (let i = 0; i < 1001; i++) {
      await validateAccess(requestFrom("https://s.com"), `s${i}`, kv);
    }
    expect(get).toHaveBeenCalledTimes(1001);

    await validateAccess(requestFrom("https://s.com"), "s1000", kv);
    expect(get).toHaveBeenCalledTimes(1001);

    await validateAccess(requestFrom("https://s.com"), "s500", kv);
    expect(get).toHaveBeenCalledTimes(1001);
  });
});
