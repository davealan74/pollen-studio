import type { PollinationsClient } from './client';

export interface TextRequest {
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export async function generateText(c: PollinationsClient, req: TextRequest): Promise<string> {
  const res = await c.fetch(`${c.bases.text}/openai`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: req.model,
      messages: [{ role: 'user', content: req.prompt }],
      temperature: req.temperature,
      max_tokens: req.maxTokens,
      stream: false
    })
  });
  const data = (await res.json()) as ChatCompletionResponse;
  return data.choices?.[0]?.message?.content ?? '';
}
