// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { startMockPollinations, type MockServer } from '../../../tests/mock-pollinations/server';
import { PollinationsClient } from './client';
import { storeKey, clearKey } from './auth';
import { generateImage } from './image';
import { generateText } from './text';
import { generateAudio } from './audio';

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
let client: PollinationsClient;
beforeEach(async () => {
  svr = await startMockPollinations();
  storeKey('sk_testKeyValid01', 'persistent');
  client = new PollinationsClient({ bases: { image: svr.url, text: svr.url }, pacingMs: 0 });
});
afterEach(async () => {
  await svr.close();
  clearKey();
});

describe('generateImage', () => {
  it('returns a PNG blob', async () => {
    const blob = await generateImage(client, {
      prompt: 'sunset over Valletta',
      model: 'flux',
      width: 1024,
      height: 1024,
      quality: 'high',
      enhance: false,
      seed: -1
    });
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
    expect(svr.requests[0].path).toBe(
      '/prompt/sunset%20over%20Valletta?model=flux&width=1024&height=1024&quality=high&enhance=false&seed=-1&nologo=true'
    );
  });

  it('percent-encodes prompts containing /, ?, #, &', async () => {
    await generateImage(client, {
      prompt: 'a/b?c#d&e',
      model: 'flux',
      width: 512,
      height: 512,
      quality: 'high',
      enhance: false,
      seed: 1
    });
    expect(svr.requests[0].path.startsWith('/prompt/a%2Fb%3Fc%23d%26e?')).toBe(true);
  });
});

describe('generateText', () => {
  it('returns the assistant content from an OpenAI chat-completions response', async () => {
    const out = await generateText(client, {
      prompt: 'haiku about pollen',
      model: 'openai',
      temperature: 0.7,
      maxTokens: 256
    });
    expect(out).toContain('haiku about pollen');
    expect(svr.requests[0].path).toBe('/openai');
    expect(svr.requests[0].method).toBe('POST');
    expect(svr.requests[0].body).toEqual({
      model: 'openai',
      messages: [{ role: 'user', content: 'haiku about pollen' }],
      temperature: 0.7,
      max_tokens: 256,
      stream: false
    });
  });
});

describe('generateAudio', () => {
  it('returns an MP3 blob from a GET with model=openai-audio', async () => {
    const blob = await generateAudio(client, {
      prompt: 'hello world',
      voice: 'alloy'
    });
    expect(blob.type).toBe('audio/mpeg');
    expect(blob.size).toBeGreaterThan(0);
    expect(svr.requests[0].method).toBe('GET');
    expect(svr.requests[0].path).toBe('/hello%20world?model=openai-audio&voice=alloy');
  });
});
