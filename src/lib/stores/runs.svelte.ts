import { listRuns, putRun, deleteRun, type StoredRun } from '$db/idb';

interface RunsState {
  items: StoredRun[];
  loaded: boolean;
}

export const runs = $state<RunsState>({ items: [], loaded: false });

export async function loadRuns(): Promise<void> {
  runs.items = await listRuns();
  runs.loaded = true;
}

export async function saveRun(r: StoredRun): Promise<void> {
  await putRun(r);
  runs.items = [r, ...runs.items.filter((x) => x.id !== r.id)];
}

export async function removeRun(id: string): Promise<void> {
  await deleteRun(id);
  runs.items = runs.items.filter((x) => x.id !== id);
}
