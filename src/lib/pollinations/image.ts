import type { PollinationsClient } from './client';

export interface ImageRequest {
  prompt: string;
  model: string;
  width: number;
  height: number;
  quality: 'low' | 'medium' | 'high' | 'hd';
  enhance: boolean;
  seed: number; // -1 for random
  negativePrompt?: string;
}

export async function generateImage(c: PollinationsClient, req: ImageRequest): Promise<Blob> {
  const qs = new URLSearchParams({
    model: req.model,
    width: String(req.width),
    height: String(req.height),
    quality: req.quality,
    enhance: String(req.enhance),
    seed: String(req.seed),
    nologo: 'true'
  });
  if (req.negativePrompt) qs.set('negative_prompt', req.negativePrompt);
  const res = await c.fetch(`/image/${encodeURIComponent(req.prompt)}?${qs}`);
  return await res.blob();
}
