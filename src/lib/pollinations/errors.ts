import { goto } from '$app/navigation';
import { AuthRequiredError, BudgetExhaustedError, RateLimitedError } from './client';

export function handleAuthError(
  err: unknown,
  opts: { onToast: (msg: string, k: 'error' | 'info') => void }
): boolean {
  if (err instanceof AuthRequiredError) {
    opts.onToast('Session expired — reconnect.', 'error');
    goto('/auth/start');
    return true;
  }
  if (err instanceof BudgetExhaustedError) {
    opts.onToast('Budget exhausted. Re-authorize with a larger budget.', 'error');
    goto('/auth/start');
    return true;
  }
  if (err instanceof RateLimitedError) {
    opts.onToast('Rate limited — Compare mode paces requests automatically.', 'info');
    return true;
  }
  return false;
}
