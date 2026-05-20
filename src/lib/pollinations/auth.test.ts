import { describe, it, expect } from 'vitest';
import {
  buildAuthorizeUrl,
  parseCallbackFragment,
  storeKey,
  currentKey,
  clearKey,
  STATE_KEY,
  STORAGE_KEY
} from './auth';

describe('buildAuthorizeUrl', () => {
  it('includes required params and stashes state in sessionStorage', () => {
    const url = new URL(
      buildAuthorizeUrl({
        authorizeBase: 'https://enter.pollinations.ai',
        clientId: 'pk_app',
        redirectUri: 'https://pollenstudio.cru2.net/auth/callback',
        scope: 'profile usage',
        budget: 500,
        expiry: 30
      })
    );
    expect(url.origin + url.pathname).toBe('https://enter.pollinations.ai/authorize');
    expect(url.searchParams.get('client_id')).toBe('pk_app');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'https://pollenstudio.cru2.net/auth/callback'
    );
    expect(url.searchParams.get('scope')).toBe('profile usage');
    expect(url.searchParams.get('budget')).toBe('500');
    expect(url.searchParams.get('expiry')).toBe('30');
    const state = url.searchParams.get('state');
    expect(state).toMatch(/^[a-z0-9]{32,}$/);
    expect(sessionStorage.getItem(STATE_KEY)).toBe(state);
  });
});

describe('parseCallbackFragment', () => {
  it('returns key when state matches stashed value', () => {
    sessionStorage.setItem(STATE_KEY, 'good');
    const r = parseCallbackFragment('#api_key=sk_realisticKey1234&state=good');
    expect(r).toEqual({ ok: true, key: 'sk_realisticKey1234' });
    expect(sessionStorage.getItem(STATE_KEY)).toBeNull();
  });
  it('rejects state mismatch and never returns the key', () => {
    sessionStorage.setItem(STATE_KEY, 'good');
    const r = parseCallbackFragment('#api_key=sk_realisticKey1234&state=bad');
    expect(r).toEqual({ ok: false, reason: 'state_mismatch' });
  });
  it('rejects when state is missing locally', () => {
    const r = parseCallbackFragment('#api_key=sk_realisticKey1234&state=good');
    expect(r.ok).toBe(false);
  });
  it('rejects when api_key prefix is unrecognised', () => {
    sessionStorage.setItem(STATE_KEY, 'good');
    const r = parseCallbackFragment('#api_key=zzz_bad&state=good');
    expect(r).toEqual({ ok: false, reason: 'bad_key_format' });
  });
});

describe('storeKey / currentKey / clearKey', () => {
  it('persists to localStorage by default', () => {
    storeKey('sk_localPersistKey01', 'persistent');
    expect(currentKey()).toBe('sk_localPersistKey01');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('sk_localPersistKey01');
  });
  it('persists to sessionStorage when mode=session', () => {
    storeKey('sk_sessionOnlyKey02', 'session');
    expect(currentKey()).toBe('sk_sessionOnlyKey02');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('sk_sessionOnlyKey02');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
  it('clearKey wipes both stores', () => {
    storeKey('sk_anyValidKey003', 'persistent');
    clearKey();
    expect(currentKey()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
