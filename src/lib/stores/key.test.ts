import { describe, it, expect, beforeEach } from 'vitest';
import { keyStore, setKey, disconnect } from './key.svelte';

beforeEach(() => {
  disconnect();
});

describe('keyStore', () => {
  it('starts disconnected', () => {
    expect(keyStore.key).toBeNull();
  });
  it('setKey mutates the rune and persists', () => {
    setKey('sk_testStoreKey01', 'persistent');
    expect(keyStore.key).toBe('sk_testStoreKey01');
    expect(localStorage.getItem('pollen_studio.key')).toBe('sk_testStoreKey01');
  });
  it('disconnect clears state and storage', () => {
    setKey('sk_testStoreKey01', 'persistent');
    disconnect();
    expect(keyStore.key).toBeNull();
    expect(localStorage.getItem('pollen_studio.key')).toBeNull();
  });
});
