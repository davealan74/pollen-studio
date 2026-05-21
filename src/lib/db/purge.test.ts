import { describe, it, expect, beforeEach } from 'vitest';
import { putRun, listRuns, _resetForTests, type StoredRun } from './idb';
import { purgeOlderThan } from './purge';

const run = (id: string, ageDays: number): StoredRun => ({
  id,
  createdAt: Date.now() - ageDays * 86_400_000,
  surface: 'image',
  mode: 'simple',
  prompt: '',
  request: {},
  cells: []
});

beforeEach(async () => {
  await _resetForTests();
});

describe('purgeOlderThan', () => {
  it('removes runs older than the cutoff', async () => {
    await putRun(run('keep', 5));
    await putRun(run('drop', 45));
    const removed = await purgeOlderThan(30);
    expect(removed).toBe(1);
    expect((await listRuns()).map((r) => r.id)).toEqual(['keep']);
  });
});
