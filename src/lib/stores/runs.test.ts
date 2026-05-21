import { describe, it, expect, beforeEach } from 'vitest';
import { runs, loadRuns, saveRun, removeRun } from './runs.svelte';
import { _resetForTests, type StoredRun } from '$db/idb';

const make = (id: string, t: number): StoredRun => ({
  id,
  createdAt: t,
  surface: 'image',
  mode: 'simple',
  prompt: '',
  request: {},
  cells: []
});

beforeEach(async () => {
  await _resetForTests();
  runs.items = [];
  runs.loaded = false;
});

describe('runs store', () => {
  it('loads from IDB', async () => {
    await saveRun(make('a', 100));
    runs.items = [];
    await loadRuns();
    expect(runs.items.map((r) => r.id)).toEqual(['a']);
    expect(runs.loaded).toBe(true);
  });
  it('removeRun drops from store and IDB', async () => {
    await saveRun(make('a', 100));
    await removeRun('a');
    expect(runs.items).toEqual([]);
    await loadRuns();
    expect(runs.items).toEqual([]);
  });
});
