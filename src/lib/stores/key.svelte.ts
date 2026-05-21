import { currentKey, storeKey as persist, clearKey, type StorageMode } from '$pollinations/auth';

interface KeyState {
  key: string | null;
  mode: StorageMode;
  budget?: { cap: number; used: number; expiresAt: number };
}

export const keyStore = $state<KeyState>({
  key: currentKey(),
  mode: 'persistent'
});

export function setKey(key: string, mode: StorageMode = 'persistent'): void {
  persist(key, mode);
  keyStore.key = key;
  keyStore.mode = mode;
}

export function disconnect(): void {
  clearKey();
  keyStore.key = null;
  keyStore.budget = undefined;
}

export function setBudget(cap: number, used: number, expiresAt: number): void {
  keyStore.budget = { cap, used, expiresAt };
}
