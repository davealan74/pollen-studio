import type { PollinationsClient } from './client';

export interface AudioRequest {
  prompt: string;
  voice: string;
}

// Pollinations TTS is a GET on text.pollinations.ai/{prompt}?model=openai-audio&voice=...
// returning raw MP3 bytes. There is no speed/rate parameter on the public endpoint.
export async function generateAudio(c: PollinationsClient, req: AudioRequest): Promise<Blob> {
  const qs = new URLSearchParams({ model: 'openai-audio', voice: req.voice });
  const res = await c.fetch(`${c.bases.text}/${encodeURIComponent(req.prompt)}?${qs}`);
  return await res.blob();
}
