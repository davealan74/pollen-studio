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

const mkBases = (url: string) => ({ image: url, text: url });

describe('PollinationsClient', () => {
  it('attaches Authorization header from current key', async () => {
    const c = new PollinationsClient({ bases: mkBases(svr.url), pacingMs: 0 });
    const r = await c.fetch(`${svr.url}/prompt/hi`);
    expect(r.status).toBe(200);
    expect(svr.requests[0].auth).toBe('Bearer sk_testKeyValid01');
  });

  it('throws AuthRequiredError when no key is set', async () => {
    clearKey();
    const c = new PollinationsClient({ bases: mkBases(svr.url), pacingMs: 0 });
    await expect(c.fetch(`${svr.url}/prompt/hi`)).rejects.toMatchObject({
      name: 'AuthRequiredError'
    });
  });

  it('paces requests at the configured interval', async () => {
    const c = new PollinationsClient({ bases: mkBases(svr.url), pacingMs: 60 });
    const start = Date.now();
    await Promise.all([
      c.fetch(`${svr.url}/prompt/a`),
      c.fetch(`${svr.url}/prompt/b`),
      c.fetch(`${svr.url}/prompt/c`)
    ]);
    // 2 gaps × 60 ms = 120 ms ideal; allow 10 ms slack so CI runners don't false-fail.
    expect(Date.now() - start).toBeGreaterThanOrEqual(110);
  });

  const respondWith =
    (status: number, body = ''): typeof fetch =>
    async () =>
      new Response(body, { status });

  it('throws AuthRequiredError on 401', async () => {
    const c = new PollinationsClient({
      bases: mkBases(svr.url),
      pacingMs: 0,
      fetchImpl: respondWith(401)
    });
    await expect(c.fetch(`${svr.url}/prompt/x`)).rejects.toBeInstanceOf(AuthRequiredError);
  });

  it('throws BudgetExhaustedError on 402', async () => {
    const c = new PollinationsClient({
      bases: mkBases(svr.url),
      pacingMs: 0,
      fetchImpl: respondWith(402)
    });
    await expect(c.fetch(`${svr.url}/prompt/x`)).rejects.toBeInstanceOf(BudgetExhaustedError);
  });

  it('throws RateLimitedError on 429', async () => {
    const c = new PollinationsClient({
      bases: mkBases(svr.url),
      pacingMs: 0,
      fetchImpl: respondWith(429)
    });
    await expect(c.fetch(`${svr.url}/prompt/x`)).rejects.toBeInstanceOf(RateLimitedError);
  });

  it('throws UpstreamError with status on 503', async () => {
    const c = new PollinationsClient({
      bases: mkBases(svr.url),
      pacingMs: 0,
      fetchImpl: respondWith(503, 'oops')
    });
    const err = await c.fetch(`${svr.url}/prompt/x`).catch((e) => e);
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
    const c = new PollinationsClient({ bases: mkBases(svr.url), pacingMs: 0, fetchImpl });
    await expect(c.fetch(`${svr.url}/prompt/a`)).rejects.toMatchObject({
      name: 'RateLimitedError'
    });
    const r = await c.fetch(`${svr.url}/prompt/b`);
    expect(r.status).toBe(200);
  });
});
