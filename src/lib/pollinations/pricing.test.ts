import { describe, it, expect } from 'vitest';
import { estimatePollenCost, totalCost } from './pricing';

describe('estimatePollenCost', () => {
  it('flux costs 0.001 pollen per image', () => {
    expect(
      estimatePollenCost({
        surface: 'image',
        model: 'flux',
        width: 1024,
        height: 1024,
        quality: 'high'
      })
    ).toBeCloseTo(0.001);
  });

  it('doubles when enhance=true (second model pass)', () => {
    expect(
      estimatePollenCost({
        surface: 'image',
        model: 'flux',
        width: 1024,
        height: 1024,
        quality: 'high',
        enhance: true
      })
    ).toBeCloseTo(0.002);
  });

  it('falls back to the default image price for unknown models', () => {
    expect(
      estimatePollenCost({
        surface: 'image',
        model: 'something-new',
        width: 512,
        height: 512,
        quality: 'high'
      })
    ).toBeCloseTo(0.01);
  });

  it('text scales with tokens: openai @ 64 prompt + 512 max ≈ 0.000208 pollen', () => {
    // (64 * 0.05 + 512 * 0.4) / 1_000_000 = 0.0002088
    expect(estimatePollenCost({ surface: 'text', model: 'openai', maxTokens: 512 })).toBeCloseTo(
      0.000208,
      6
    );
  });

  it('TTS is a flat ~0.02 pollen per call', () => {
    expect(estimatePollenCost({ surface: 'audio', model: 'tts-1', voice: 'alloy' })).toBeCloseTo(
      0.02
    );
  });
});

describe('totalCost', () => {
  it('6 flux/high cells ≈ 0.006 pollen', () => {
    const cell = {
      surface: 'image' as const,
      model: 'flux',
      width: 1024,
      height: 1024,
      quality: 'high' as const
    };
    expect(totalCost(Array(6).fill(cell))).toBeCloseTo(0.006);
  });
});
