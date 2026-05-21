export interface Toast {
  id: number;
  kind: 'info' | 'error' | 'success';
  message: string;
}

let nextId = 1;
export const toasts = $state<{ items: Toast[] }>({ items: [] });

export function showToast(message: string, kind: Toast['kind'] = 'info', ttlMs = 4000): void {
  const id = nextId++;
  toasts.items = [...toasts.items, { id, kind, message }];
  setTimeout(() => {
    toasts.items = toasts.items.filter((t) => t.id !== id);
  }, ttlMs);
}
