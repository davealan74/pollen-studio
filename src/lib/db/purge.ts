import { openDb } from './idb';

export async function purgeOlderThan(days: number): Promise<number> {
  const cutoff = Date.now() - days * 86_400_000;
  const db = await openDb();
  const tx = db.transaction(['runs', 'blobs'], 'readwrite');
  const runs = tx.objectStore('runs');
  const blobs = tx.objectStore('blobs');
  const idx = runs.index('createdAt');
  let n = 0;
  for await (const c of idx.iterate(IDBKeyRange.upperBound(cutoff))) {
    const id = (c.value as { id: string }).id;
    await c.delete();
    // ':' = 0x3A, ';' = 0x3B — sweeps all keys of the form `${id}:*`
    const range = IDBKeyRange.bound(`${id}:`, `${id};`, false, false);
    for await (const bc of blobs.iterate(range)) await bc.delete();
    n++;
  }
  await tx.done;
  return n;
}

export interface QuotaSnapshot {
  usage: number;
  quota: number;
  ratio: number;
}

export async function quotaSnapshot(): Promise<QuotaSnapshot | null> {
  if (!('storage' in navigator) || !navigator.storage.estimate) return null;
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return { usage, quota, ratio: quota ? usage / quota : 0 };
}

export const QUOTA_WARN_RATIO = 0.8;
