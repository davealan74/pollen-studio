import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { PNG_BYTES, MP3_BYTES, CANNED_TEXT } from './fixtures.js';

export interface MockServer {
  url: string;
  close(): Promise<void>;
  requests: Array<{ method: string; path: string; auth?: string; token?: string; body?: unknown }>;
}

export async function startMockPollinations(port = 0): Promise<MockServer> {
  const log: MockServer['requests'] = [];

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const auth = req.headers['authorization'] as string | undefined;
    const body = await readBody(req);
    const m = auth?.match(/^Bearer\s+(\S+)$/);
    log.push({
      method: req.method ?? 'GET',
      path: url.pathname + url.search,
      auth,
      token: m?.[1],
      body
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type'
      });
      res.end();
      return;
    }

    if (url.pathname === '/authorize') {
      const redirect = url.searchParams.get('redirect_uri');
      const state = url.searchParams.get('state') ?? '';
      if (!redirect) return send(res, 400, 'missing redirect_uri');
      res.writeHead(302, { Location: `${redirect}#api_key=sk_mock&state=${state}` });
      res.end();
      return;
    }

    if (!auth || !auth.startsWith('Bearer ')) {
      return sendJson(res, 401, { error: 'unauthenticated' });
    }

    if (req.method === 'GET' && url.pathname.startsWith('/image/')) {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' });
      res.end(Buffer.from(PNG_BYTES));
      return;
    }
    if (req.method === 'POST' && url.pathname === '/text') {
      const prompt = (body as { prompt?: string })?.prompt ?? '';
      return sendJson(res, 200, { text: CANNED_TEXT(prompt) });
    }
    if (req.method === 'POST' && url.pathname === '/audio') {
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Access-Control-Allow-Origin': '*' });
      res.end(Buffer.from(MP3_BYTES));
      return;
    }
    return sendJson(res, 404, { error: 'not_found', path: url.pathname });
  }

  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res).catch((err) => {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ECONNRESET' || (err as Error).message === 'aborted') return;
      if (!res.headersSent) {
        try {
          sendJson(res, 500, {
            error: 'handler_threw',
            message: String((err as Error).message ?? err)
          });
        } catch {
          /* socket gone */
        }
      }
    });
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
  try {
    for await (const c of req) chunks.push(c as Buffer);
  } catch {
    return undefined; // client disconnected mid-body
  }
  if (chunks.length === 0) return undefined;
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const CORS = { 'Access-Control-Allow-Origin': '*' };

function send(res: ServerResponse, status: number, body: string) {
  res.writeHead(status, { 'Content-Type': 'text/plain', ...CORS });
  res.end(body);
}
function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify(body));
}
