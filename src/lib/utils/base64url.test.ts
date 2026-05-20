import { describe, it, expect } from 'vitest';
import { encode, decode } from './base64url';

describe('base64url', () => {
  it('round-trips ASCII text', () => {
    const s = 'hello, world';
    expect(decode(encode(s))).toBe(s);
  });
  it('round-trips Unicode text', () => {
    const s = 'café 🌸 prompt';
    expect(decode(encode(s))).toBe(s);
  });
  it('produces URL-safe characters only', () => {
    const enc = encode('any?prompt&with=symbols/+=');
    expect(enc).not.toMatch(/[+/=]/);
  });
  it('decodes without padding', () => {
    const enc = encode('a');
    expect(enc.endsWith('=')).toBe(false);
    expect(decode(enc)).toBe('a');
  });
});
