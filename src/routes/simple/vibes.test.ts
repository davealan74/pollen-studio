import { describe, it, expect } from 'vitest';
import { VIBES, vibeById } from './vibes';

describe('vibes', () => {
  it('contains four vibes covering image + audio surfaces', () => {
    expect(VIBES).toHaveLength(4);
    expect(VIBES.filter((v) => v.surface === 'audio')).toHaveLength(1);
  });
  it('lookup returns matching vibe', () => {
    expect(vibeById('photoreal')?.label).toBe('Photoreal');
    expect(vibeById('missing')).toBeUndefined();
  });
});
