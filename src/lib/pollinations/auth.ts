export const STATE_KEY = 'pollen_studio.oauth_state';
export const STORAGE_KEY = 'pollen_studio.key';

export type StorageMode = 'persistent' | 'session';

const KEY_SHAPE = /^(sk|pk)_[A-Za-z0-9][A-Za-z0-9_-]{7,255}$/;

function isValidKeyShape(key: string): boolean {
  return KEY_SHAPE.test(key);
}

export interface AuthorizeParams {
  authorizeBase: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  budget: number;
  expiry: number;
}

export function buildAuthorizeUrl(p: AuthorizeParams): string {
  const state = randomState();
  sessionStorage.setItem(STATE_KEY, state);
  const u = new URL('/authorize', p.authorizeBase);
  u.searchParams.set('client_id', p.clientId);
  u.searchParams.set('redirect_uri', p.redirectUri);
  u.searchParams.set('scope', p.scope);
  u.searchParams.set('budget', String(p.budget));
  u.searchParams.set('expiry', String(p.expiry));
  u.searchParams.set('state', state);
  return u.toString();
}

export type ParseResult =
  | { ok: true; key: string }
  | { ok: false; reason: 'state_missing' | 'state_mismatch' | 'no_key' | 'bad_key_format' };

export function parseCallbackFragment(fragment: string): ParseResult {
  const params = new URLSearchParams(fragment.replace(/^#/, ''));
  const key = params.get('api_key');
  const state = params.get('state');
  const expected = sessionStorage.getItem(STATE_KEY);
  if (!expected) return { ok: false, reason: 'state_missing' };
  if (state !== expected) return { ok: false, reason: 'state_mismatch' };
  if (!key) return { ok: false, reason: 'no_key' };
  if (!isValidKeyShape(key)) return { ok: false, reason: 'bad_key_format' };
  sessionStorage.removeItem(STATE_KEY);
  return { ok: true, key };
}

export function storeKey(key: string, mode: StorageMode): void {
  if (!isValidKeyShape(key)) throw new Error('invalid key shape');
  // Clear both first so currentKey() has a single source of truth even if the
  // setItem call below throws (e.g. QuotaExceededError).
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  (mode === 'session' ? sessionStorage : localStorage).setItem(STORAGE_KEY, key);
}

export function currentKey(): string | null {
  return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
}

export function clearKey(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
