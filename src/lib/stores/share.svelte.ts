import { encode, decode } from '$utils/base64url';

export interface ShareablePayload {
  surface: 'image' | 'text' | 'audio';
  mode: 'simple' | 'compare' | 'advanced';
  prompt: string;
  request: Record<string, unknown>;
}

const HARD_CAP = 1500;

export class ShareTooLargeError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ShareTooLargeError';
  }
}

export function encodeShareHash(p: ShareablePayload): string {
  const json = JSON.stringify(p);
  const enc = encode(json);
  if (enc.length > HARD_CAP) throw new ShareTooLargeError(`payload ${enc.length} > ${HARD_CAP}`);
  return `#run=${enc}`;
}

export function decodeShareHash(hash: string): ShareablePayload | null {
  const m = hash.match(/[#&]run=([^&]+)/);
  if (!m) return null;
  try {
    const obj = JSON.parse(decode(m[1])) as ShareablePayload;
    if (!obj.surface || !obj.mode || !obj.prompt) return null;
    return obj;
  } catch {
    return null;
  }
}

export function routeFor(p: ShareablePayload): string {
  return `/${p.mode}${encodeShareHash(p)}`;
}
