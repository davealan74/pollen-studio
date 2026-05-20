// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { startMockPollinations, type MockServer } from './server';

let svr: MockServer | undefined;
afterEach(async () => {
  await svr?.close();
  svr = undefined;
});

describe('mock pollinations', () => {
  it('refuses unauthenticated requests', async () => {
    svr = await startMockPollinations();
    const r = await fetch(`${svr.url}/image/hi`);
    expect(r.status).toBe(401);
  });

  it('returns PNG bytes on /image with auth', async () => {
    svr = await startMockPollinations();
    const r = await fetch(`${svr.url}/image/hi`, { headers: { authorization: 'Bearer sk_x' } });
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('image/png');
    const buf = new Uint8Array(await r.arrayBuffer());
    expect(buf[0]).toBe(0x89); // PNG magic
  });

  it('echoes state on /authorize redirect', async () => {
    svr = await startMockPollinations();
    const url = `${svr.url}/authorize?redirect_uri=http://app.local/cb&state=xyz`;
    const r = await fetch(url, { redirect: 'manual' });
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('http://app.local/cb#api_key=sk_mock&state=xyz');
  });

  it('returns canned text', async () => {
    svr = await startMockPollinations();
    const r = await fetch(`${svr.url}/text`, {
      method: 'POST',
      headers: { authorization: 'Bearer sk_x', 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: 'tell me a poem' })
    });
    const json = (await r.json()) as { text: string };
    expect(json.text).toContain('tell me a poem');
  });
});
