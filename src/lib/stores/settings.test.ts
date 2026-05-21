import { describe, it, expect, beforeEach } from 'vitest';
import { settings, updateSettings } from './settings.svelte';

beforeEach(() => {
  localStorage.clear();
  updateSettings({ sessionOnlyKey: false, defaultImageModel: 'flux', theme: 'dark' });
});

describe('settings', () => {
  it('exposes defaults when nothing is stored', () => {
    expect(settings.defaultImageModel).toBe('flux');
  });
  it('persists updates', () => {
    updateSettings({ defaultImageModel: 'imagen-4' });
    expect(JSON.parse(localStorage.getItem('pollen_studio.settings')!).defaultImageModel).toBe(
      'imagen-4'
    );
  });
});
