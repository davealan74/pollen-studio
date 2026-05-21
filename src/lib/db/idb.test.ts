import { describe, it, expect, beforeEach } from 'vitest';
import {
  openDb,
  putRun,
  listRuns,
  deleteRun,
  putBlob,
  getBlob,
  _resetForTests,
  type StoredRun
} from './idb';

const sampleRun = (id: string, t = Date.now()): StoredRun => ({
  id,
  createdAt: t,
  surface: 'image',
  mode: 'simple',
  prompt: 'p',
  request: { prompt: 'p' } as unknown,
  cells: []
});

beforeEach(async () => {
  await _resetForTests();
});

describe('idb', () => {
  it('opens the database with both object stores', async () => {
    const db = await openDb();
    expect(Array.from(db.objectStoreNames).sort()).toEqual(['blobs', 'runs']);
  });

  it('round-trips a run', async () => {
    await putRun(sampleRun('a', 100));
    const out = await listRuns();
    expect(out[0].id).toBe('a');
  });

  it('lists runs newest-first', async () => {
    await putRun(sampleRun('a', 100));
    await putRun(sampleRun('b', 200));
    await putRun(sampleRun('c', 150));
    const out = await listRuns();
    expect(out.map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('deletes a run', async () => {
    await putRun(sampleRun('a'));
    await deleteRun('a');
    expect((await listRuns()).length).toBe(0);
  });

  it('round-trips a blob', async () => {
    const b = new Blob(['hi'], { type: 'text/plain' });
    await putBlob('cell1', b);
    const out = await getBlob('cell1');
    expect(out).not.toBeNull();
    expect(await out!.text()).toBe('hi');
  });
});
