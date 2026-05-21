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
  | { surface: 'text'; model: string; maxTokens: number }
  | { surface: 'audio'; model: string; voice: string; speed: number };

// Heuristic estimates — exact billing comes from Pollinations response. We err
// on the high side so the UI never under-promises cost.
export function estimatePollenCost(c: CostInput): number {
  if (c.surface === 'image') {
    const base = c.quality === 'hd' ? 2 : c.quality === 'high' ? 1 : 0.5;
    return base + (c.enhance ? 0.25 : 0);
  }
  if (c.surface === 'text') return 0.1;
  return 0.2;
}

export function totalCost(cells: CostInput[]): number {
  return cells.reduce((acc, c) => acc + estimatePollenCost(c), 0);
}

export type { Surface };
