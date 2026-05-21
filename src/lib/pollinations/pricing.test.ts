import { describe, it, expect } from 'vitest';
import { estimatePollenCost } from './pricing';

describe('estimatePollenCost', () => {
  it('charges 1 pollen for a default flux image', () => {
    expect(
      estimatePollenCost({
        surface: 'image',
        model: 'flux',
        width: 1024,
        height: 1024,
        quality: 'high'
      })
    ).toBe(1);
  });
  it('charges 2 pollen for hd quality', () => {
    expect(
      estimatePollenCost({
        surface: 'image',
        model: 'flux',
        width: 1024,
        height: 1024,
        quality: 'hd'
      })
    ).toBe(2);
  });
  it('text is 0.1 pollen per call', () => {
    expect(estimatePollenCost({ surface: 'text', model: 'openai', maxTokens: 512 })).toBeCloseTo(
      0.1
    );
  });
  it('audio is 0.2 pollen per call', () => {
    expect(
      estimatePollenCost({ surface: 'audio', model: 'tts-1', voice: 'alloy', speed: 1 })
    ).toBeCloseTo(0.2);
  });
});
