import { describe, it, expect, beforeEach } from 'vitest';
import { putRun, listRuns, putBlob, getBlob, _resetForTests, type StoredRun } from './idb';
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

  it('purgeOlderThan also deletes orphaned blobs for purged runs', async () => {
    await putRun(run('keep', 5));
    await putRun(run('drop', 45));
    await putBlob('keep:0', new Blob(['k'], { type: 'image/png' }));
    await putBlob('drop:0', new Blob(['d'], { type: 'image/png' }));
    await purgeOlderThan(30);
    expect(await getBlob('keep:0')).not.toBeNull();
    expect(await getBlob('drop:0')).toBeNull();
  });
});
