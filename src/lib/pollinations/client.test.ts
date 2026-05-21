// @vitest-environment-options {"settings": {"fetch": {"disableSameOriginPolicy": true}}}
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startMockPollinations, type MockServer } from '../../../tests/mock-pollinations/server';
import { PollinationsClient } from './client';
import { storeKey, clearKey } from './auth';

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
});
