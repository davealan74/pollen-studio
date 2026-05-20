import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { PNG_BYTES, MP3_BYTES, CANNED_TEXT } from './fixtures.js';

export interface MockServer {
  url: string;
  close(): Promise<void>;
  requests: Array<{ method: string; path: string; auth?: string; body?: unknown }>;
}

export async function startMockPollinations(port = 0): Promise<MockServer> {
  const log: MockServer['requests'] = [];

  const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const auth = req.headers['authorization'] as string | undefined;
    const body = await readBody(req);
    log.push({ method: req.method ?? 'GET', path: url.pathname + url.search, auth, body });

    if (url.pathname === '/authorize') {
      const redirect = url.searchParams.get('redirect_uri');
      const state = url.searchParams.get('state') ?? '';
      if (!redirect) return send(res, 400, 'missing redirect_uri');
      res.writeHead(302, { Location: `${redirect}#api_key=sk_mock&state=${state}` });
      return res.end();
    }

    if (!auth || !auth.startsWith('Bearer ')) {
      return sendJson(res, 401, { error: 'unauthenticated' });
    }

    if (req.method === 'GET' && url.pathname.startsWith('/image/')) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      return res.end(Buffer.from(PNG_BYTES));
    }
    if (req.method === 'POST' && url.pathname === '/text') {
      const prompt = (body as { prompt?: string })?.prompt ?? '';
      return sendJson(res, 200, { text: CANNED_TEXT(prompt) });
    }
    if (req.method === 'POST' && url.pathname === '/audio') {
      res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
      return res.end(Buffer.from(MP3_BYTES));
    }
    return sendJson(res, 404, { error: 'not_found', path: url.pathname });
  });

  await new Promise<void>((resolve) => server.listen(port, resolve));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('mock server failed to bind');
  return {
    url: `http://127.0.0.1:${addr.port}`,
    requests: log,
    close: () =>
      new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())))
  };
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  if (req.method !== 'POST') return undefined;
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  if (chunks.length === 0) return undefined;
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function send(res: ServerResponse, status: number, body: string) {
  res.writeHead(status, { 'Content-Type': 'text/plain' });
  res.end(body);
}
function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}
