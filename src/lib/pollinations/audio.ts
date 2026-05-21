import type { PollinationsClient } from './client';

export interface AudioRequest {
  prompt: string;
  model: string;
  voice: string;
  speed: number;
}

export async function generateAudio(c: PollinationsClient, req: AudioRequest): Promise<Blob> {
  const res = await c.fetch('/audio', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      prompt: req.prompt,
      model: req.model,
      voice: req.voice,
      speed: req.speed
    })
  });
  return await res.blob();
}
