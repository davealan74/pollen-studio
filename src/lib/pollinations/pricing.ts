import type { Surface } from './models';

export type CostInput =
  | {
      surface: 'image';
      model: string;
      width: number;
      height: number;
      quality: 'low' | 'medium' | 'high' | 'hd';
      enhance?: boolean;
    }
  | { surface: 'text'; model: string; maxTokens: number; promptTokens?: number }
  | { surface: 'audio'; model: string; voice: string };

// Per-image price in pollen. Source: pollinations/pollinations/shared/registry/image.ts
// (snapshot 2026-05-22). 1 pollen ≈ 1 USD. Pollinations bills per image, not by
// quality/size, so we don't apply a quality multiplier. `enhance` runs a second
// pass through the model, so we charge double.
const IMAGE_PRICE_POLLEN: Record<string, number> = {
  flux: 0.001,
  gptimage: 0.03,
  'imagen-4': 0.04
};
const DEFAULT_IMAGE_PRICE_POLLEN = 0.01;

// Text models: prices are per-million tokens in pollen. Source: registry/text.ts.
// We approximate prompt tokens at 64 when caller doesn't provide promptTokens.
const TEXT_PRICE_PER_M_POLLEN: Record<string, { in: number; out: number }> = {
  openai: { in: 0.05, out: 0.4 }, // GPT-5 Nano scale
  mistral: { in: 0.075, out: 0.2 } // Mistral Small
};
const DEFAULT_TEXT_PRICE_PER_M_POLLEN = { in: 0.5, out: 2 };

// TTS — flat per-call estimate in pollen (GPT Audio Mini scale, short responses).
const AUDIO_PRICE_POLLEN = 0.02;

export function estimatePollenCost(c: CostInput): number {
  if (c.surface === 'image') {
    const base = IMAGE_PRICE_POLLEN[c.model] ?? DEFAULT_IMAGE_PRICE_POLLEN;
    return c.enhance ? base * 2 : base;
  }
  if (c.surface === 'text') {
    const p = TEXT_PRICE_PER_M_POLLEN[c.model] ?? DEFAULT_TEXT_PRICE_PER_M_POLLEN;
    const promptTokens = c.promptTokens ?? 64;
    return (promptTokens * p.in + c.maxTokens * p.out) / 1_000_000;
  }
  return AUDIO_PRICE_POLLEN;
}

export function totalCost(cells: CostInput[]): number {
  return cells.reduce((acc, c) => acc + estimatePollenCost(c), 0);
}

export type { Surface };
