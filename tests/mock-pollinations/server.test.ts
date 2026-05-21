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
    const r = await fetch(`${svr.url}/prompt/hi`);
    expect(r.status).toBe(401);
  });

  it('returns PNG bytes on /prompt with auth', async () => {
    svr = await startMockPollinations();
    const r = await fetch(`${svr.url}/prompt/hi`, { headers: { authorization: 'Bearer sk_x' } });
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

  it('returns canned text via OpenAI chat-completions on /openai', async () => {
    svr = await startMockPollinations();
    const r = await fetch(`${svr.url}/openai`, {
      method: 'POST',
      headers: { authorization: 'Bearer sk_x', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [{ role: 'user', content: 'tell me a poem' }]
      })
    });
    const json = (await r.json()) as { choices: Array<{ message: { content: string } }> };
    expect(json.choices[0].message.content).toContain('tell me a poem');
  });

  it('returns MP3 bytes when model=openai-audio', async () => {
    svr = await startMockPollinations();
    const r = await fetch(`${svr.url}/hello%20world?model=openai-audio&voice=alloy`, {
      headers: { authorization: 'Bearer sk_x' }
    });
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('audio/mpeg');
  });

  it('handles client abort mid-body without unhandled rejection', async () => {
    svr = await startMockPollinations();
    const ctrl = new AbortController();
    // Start a slow POST and abort it immediately
    const p = fetch(`${svr.url}/openai`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { authorization: 'Bearer sk_x', 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'x'.repeat(10_000) }] })
    });
    ctrl.abort();
    await expect(p).rejects.toThrow();
    // The mock server should still be responsive
    const r = await fetch(`${svr.url}/prompt/ping`, { headers: { authorization: 'Bearer sk_x' } });
    expect(r.status).toBe(200);
  });
});
