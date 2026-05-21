export interface Vibe {
  id: 'photoreal' | 'illustration' | '3d' | 'voice';
  label: string;
  surface: 'image' | 'audio';
  request: Record<string, string | number | boolean>;
}

export const VIBES: Vibe[] = [
  {
    id: 'photoreal',
    label: 'Photoreal',
    surface: 'image',
    request: { model: 'flux', width: 1024, height: 1024, quality: 'hd', enhance: true }
  },
  {
    id: 'illustration',
    label: 'Illustration',
    surface: 'image',
    request: { model: 'flux', width: 1024, height: 1024, quality: 'high', enhance: true }
  },
  {
    id: '3d',
    label: '3D Render',
    surface: 'image',
    request: { model: 'gptimage', width: 1024, height: 1024, quality: 'high', enhance: false }
  },
  {
    id: 'voice',
    label: 'Voice-over',
    surface: 'audio',
    request: { model: 'tts-1', voice: 'alloy', speed: 1.0 }
  }
];

export function vibeById(id: string): Vibe | undefined {
  return VIBES.find((v) => v.id === id);
}
