import { describe, it, expect } from 'vitest';
import {
  encodeShareHash,
  decodeShareHash,
  ShareTooLargeError,
  type ShareablePayload
} from './share.svelte';

const payload: ShareablePayload = {
  surface: 'image',
  mode: 'simple',
  prompt: 'a sunset',
  request: { model: 'flux', width: 1024, height: 1024 }
};

describe('share hash', () => {
  it('round-trips a payload', () => {
    const hash = encodeShareHash(payload);
    expect(hash.startsWith('#run=')).toBe(true);
    expect(decodeShareHash(hash)).toEqual(payload);
  });
  it('returns null for malformed hash', () => {
    expect(decodeShareHash('#foo=bar')).toBeNull();
    expect(decodeShareHash('#run=!!!')).toBeNull();
  });
  it('throws when over the hard cap', () => {
    const big = { ...payload, prompt: 'x'.repeat(4000) };
    expect(() => encodeShareHash(big)).toThrow(ShareTooLargeError);
  });
});
