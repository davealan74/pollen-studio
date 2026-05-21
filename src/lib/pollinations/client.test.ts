// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { startMockPollinations, type MockServer } from '../../../tests/mock-pollinations/server';
import {
  PollinationsClient,
  AuthRequiredError,
  BudgetExhaustedError,
  RateLimitedError,
  UpstreamError
} from './client';
import { storeKey, clearKey } from './auth';

// Provide localStorage + sessionStorage shims so auth.ts works in the node environment.
// This is intentionally kept in the test file — production code must NOT depend on
// happy-dom-specific behaviour.
function makeStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null
  };
}

beforeAll(() => {
  (globalThis as Record<string, unknown>).localStorage = makeStorage();
  (globalThis as Record<string, unknown>).sessionStorage = makeStorage();
});

let svr: MockServer;
beforeEach(async () => {
  svr = await startMockPollinations();
  storeKey('sk_testKeyValid01', 'persistent');
});
afterEach(async () => {
  await svr.close();
  clearKey();
});

describe('PollinationsClient', () => {
  it('attaches Authorization header from current key', async () => {
    const c = new PollinationsClient({ base: svr.url, pacingMs: 0 });
    const r = await c.fetch('/image/hi');
    expect(r.status).toBe(200);
    expect(svr.requests[0].auth).toBe('Bearer sk_testKeyValid01');
  });

  it('throws AuthRequiredError when no key is set', async () => {
    clearKey();
    const c = new PollinationsClient({ base: svr.url, pacingMs: 0 });
    await expect(c.fetch('/image/hi')).rejects.toMatchObject({ name: 'AuthRequiredError' });
  });

  it('paces requests at the configured interval', async () => {
    const c = new PollinationsClient({ base: svr.url, pacingMs: 60 });
    const start = Date.now();
    await Promise.all([c.fetch('/image/a'), c.fetch('/image/b'), c.fetch('/image/c')]);
    // 2 gaps × 60 ms = 120 ms ideal; allow 10 ms slack so CI runners don't false-fail.
    expect(Date.now() - start).toBeGreaterThanOrEqual(110);
  });

  const respondWith =
    (status: number, body = ''): typeof fetch =>
    async () =>
      new Response(body, { status });

  it('throws AuthRequiredError on 401', async () => {
    const c = new PollinationsClient({ base: svr.url, pacingMs: 0, fetchImpl: respondWith(401) });
    await expect(c.fetch('/image/x')).rejects.toBeInstanceOf(AuthRequiredError);
  });

  it('throws BudgetExhaustedError on 402', async () => {
    const c = new PollinationsClient({ base: svr.url, pacingMs: 0, fetchImpl: respondWith(402) });
    await expect(c.fetch('/image/x')).rejects.toBeInstanceOf(BudgetExhaustedError);
  });

  it('throws RateLimitedError on 429', async () => {
    const c = new PollinationsClient({ base: svr.url, pacingMs: 0, fetchImpl: respondWith(429) });
    await expect(c.fetch('/image/x')).rejects.toBeInstanceOf(RateLimitedError);
  });

  it('throws UpstreamError with status on 503', async () => {
    const c = new PollinationsClient({
      base: svr.url,
      pacingMs: 0,
      fetchImpl: respondWith(503, 'oops')
    });
    const err = await c.fetch('/image/x').catch((e) => e);
    expect(err).toBeInstanceOf(UpstreamError);
    expect(err.status).toBe(503);
  });

  it('does not poison the queue after an error', async () => {
    let n = 0;
    const fetchImpl: typeof fetch = async () => {
      n++;
      if (n === 1) return new Response('rate limited', { status: 429 });
      return new Response('ok', { status: 200 });
    };
    const c = new PollinationsClient({ base: svr.url, pacingMs: 0, fetchImpl });
    await expect(c.fetch('/image/a')).rejects.toMatchObject({ name: 'RateLimitedError' });
    const r = await c.fetch('/image/b');
    expect(r.status).toBe(200);
  });
});
