export interface Axes {
  models: string[];
  seeds: number[];
  sizes?: string[];
  qualities?: string[];
  temperatures?: number[];
  voices?: string[];
  speeds?: number[];
}

export interface CellSpec {
  model: string;
  seed: number;
  size?: string;
  quality?: string;
  temperature?: number;
  voice?: string;
  speed?: number;
}

export interface CellState {
  spec: CellSpec;
  status: 'pending' | 'ok' | 'error';
  blob?: Blob | null;
  text?: string;
  error?: string;
  starred?: boolean;
}

export function expand(a: Axes): CellSpec[] {
  const out: CellSpec[] = [];
  for (const m of a.models)
    for (const s of a.seeds)
      for (const sz of a.sizes ?? [undefined])
        for (const q of a.qualities ?? [undefined])
          for (const t of a.temperatures ?? [undefined])
            for (const v of a.voices ?? [undefined])
              for (const sp of a.speeds ?? [undefined])
                out.push({
                  model: m,
                  seed: s,
                  size: sz,
                  quality: q,
                  temperature: t,
                  voice: v,
                  speed: sp
                });
  return out;
}
