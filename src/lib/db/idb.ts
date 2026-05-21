/**
 * Public API
 *   putRun(run)           – upsert a StoredRun
 *   listRuns()            – all runs, newest-first
 *   deleteRun(id)         – delete run + its blobs (see cellId convention below)
 *   putBlob(cellId, blob) – store a Blob; cellId MUST follow the convention below
 *   getBlob(cellId)       – retrieve a Blob or null
 *
 * cellId convention
 *   Every blob key MUST have the form `${runId}:${cellIndex}` (e.g. "01HXY...:0").
 *   This allows deleteRun() to sweep all blobs for a run atomically using an
 *   IDBKeyRange over the ':' … ';' byte boundary (0x3A–0x3B).
 */
import { openDB, type IDBPDatabase } from 'idb';

export interface StoredRun {
  id: string;
  createdAt: number;
  surface: 'image' | 'text' | 'audio';
  mode: 'simple' | 'compare' | 'advanced';
  prompt: string;
  request: unknown;
  cells: unknown[];
}

interface Schema {
  runs: { key: string; value: StoredRun; indexes: { createdAt: number } };
  blobs: { key: string; value: { buffer: ArrayBuffer; type: string } };
}

const DB_NAME = 'pollen-studio';
const DB_VERSION = 1;
let dbp: Promise<IDBPDatabase<Schema>> | null = null;

export function openDb(): Promise<IDBPDatabase<Schema>> {
  if (!dbp) {
    dbp = openDB<Schema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const runs = db.createObjectStore('runs', { keyPath: 'id' });
        runs.createIndex('createdAt', 'createdAt');
        db.createObjectStore('blobs');
      }
    });
  }
  return dbp;
}

export async function putRun(r: StoredRun): Promise<void> {
  const db = await openDb();
  await db.put('runs', r);
}

export async function listRuns(): Promise<StoredRun[]> {
  const db = await openDb();
  const tx = db.transaction('runs');
  const out: StoredRun[] = [];
  const idx = tx.store.index('createdAt');
  for await (const c of idx.iterate(null, 'prev')) out.push(c.value);
  return out;
}

export async function deleteRun(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(['runs', 'blobs'], 'readwrite');
  await tx.objectStore('runs').delete(id);
  const blobs = tx.objectStore('blobs');
  // ':' = 0x3A, ';' = 0x3B — sweeps all keys of the form `${id}:*`
  const range = IDBKeyRange.bound(`${id}:`, `${id};`, false, false);
  for await (const c of blobs.iterate(range)) await c.delete();
  await tx.done;
}

/**
 * Store a Blob under the given cellId.
 * cellId MUST follow the convention `${runId}:${cellIndex}` (e.g. "01HXY...:0")
 * so that deleteRun() can sweep all blobs for a run in a single transaction.
 */
export async function putBlob(cellId: string, b: Blob): Promise<void> {
  const db = await openDb();
  const buffer = await b.arrayBuffer();
  await db.put('blobs', { buffer, type: b.type }, cellId);
}

export async function getBlob(cellId: string): Promise<Blob | null> {
  const db = await openDb();
  const stored = (await db.get('blobs', cellId)) as unknown;
  if (stored == null) return null;
  if (stored instanceof Blob) return stored;
  const rec = stored as { buffer?: ArrayBuffer; type?: string };
  if (!rec.buffer) return null;
  return new Blob([rec.buffer], { type: rec.type ?? 'application/octet-stream' });
}

export async function _resetForTests(): Promise<void> {
  if (dbp) {
    (await dbp).close();
    dbp = null;
  }
  await new Promise<void>((res, rej) => {
    const r = indexedDB.deleteDatabase(DB_NAME);
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
}
