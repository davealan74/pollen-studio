import { describe, it, expect } from 'vitest';
import { newId } from './ulid';

describe('ulid', () => {
  it('produces 26-character Crockford base32 IDs', () => {
    const id = newId();
    expect(id).toHaveLength(26);
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });
  it('is monotonic across rapid calls', () => {
    const ids = Array.from({ length: 50 }, newId);
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });
});
