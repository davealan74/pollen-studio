import type { PollinationsClient } from './client';

export interface TextRequest {
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export async function generateText(c: PollinationsClient, req: TextRequest): Promise<string> {
  const res = await c.fetch('/text', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      prompt: req.prompt,
      model: req.model,
      temperature: req.temperature,
      max_tokens: req.maxTokens
    })
  });
  const data = (await res.json()) as { text?: string };
  return data.text ?? '';
}
