import { currentKey } from './auth';

export class AuthRequiredError extends Error {
  name = 'AuthRequiredError';
}
export class BudgetExhaustedError extends Error {
  name = 'BudgetExhaustedError';
}
export class RateLimitedError extends Error {
  name = 'RateLimitedError';
}
export class UpstreamError extends Error {
  name = 'UpstreamError';
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

// Spec §6: Flower-tier rate limit is 1 req / 3 s. We pace at 3100 ms so the
// client never trips it; Pollinations may relax this — when they do, drop this
// constant and revisit Compare-mode UX.
export const DEFAULT_PACING_MS = 3100;

export interface ClientOptions {
  base: string;
  pacingMs?: number;
  fetchImpl?: typeof fetch;
}

export class PollinationsClient {
  private queue: Promise<unknown> = Promise.resolve();
  private lastSent = 0;
  private readonly pacingMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly opts: ClientOptions) {
    this.pacingMs = opts.pacingMs ?? DEFAULT_PACING_MS;
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
  }

  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const key = currentKey();
    if (!key) throw new AuthRequiredError('no Pollinations key configured');
    return (this.queue = this.queue.then(async () => {
      const gap = this.pacingMs - (Date.now() - this.lastSent);
      if (gap > 0) await new Promise((r) => setTimeout(r, gap));
      this.lastSent = Date.now();
      const res = await this.fetchImpl(this.opts.base + path, {
        credentials: 'include',
        ...init,
        headers: { ...(init.headers ?? {}), Authorization: `Bearer ${key}` }
      });
      if (res.status === 401) throw new AuthRequiredError('key rejected by Pollinations');
      if (res.status === 402) throw new BudgetExhaustedError('budget exhausted');
      if (res.status === 429) throw new RateLimitedError('rate limit hit');
      if (res.status >= 500) throw new UpstreamError(res.status, await safeText(res));
      return res;
    })) as Promise<Response>;
  }
}

async function safeText(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    return '';
  }
}
