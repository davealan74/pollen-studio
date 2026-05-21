import { describe, it, expect } from 'vitest';
import { expand } from './matrix';

describe('expand', () => {
  it('produces the cartesian product of axes', () => {
    const cells = expand({ models: ['a', 'b'], seeds: [1, 2, 3] });
    expect(cells).toHaveLength(6);
  });
  it('handles a single-axis call', () => {
    expect(expand({ models: ['only'], seeds: [42] })).toEqual([{ model: 'only', seed: 42 }]);
  });
  it('respects optional image axes', () => {
    const cells = expand({
      models: ['flux'],
      seeds: [1],
      sizes: ['512x512', '1024x1024'],
      qualities: ['hd']
    });
    expect(cells).toHaveLength(2);
  });
});
