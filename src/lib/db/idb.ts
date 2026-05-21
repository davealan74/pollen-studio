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
  await db.delete('runs', id);
}

export async function putBlob(cellId: string, b: Blob): Promise<void> {
  const db = await openDb();
  const buffer = await b.arrayBuffer();
  await db.put('blobs', { buffer, type: b.type }, cellId);
}

export async function getBlob(cellId: string): Promise<Blob | null> {
  const db = await openDb();
  const stored = await db.get('blobs', cellId);
  if (!stored) return null;
  return new Blob([stored.buffer], { type: stored.type });
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
