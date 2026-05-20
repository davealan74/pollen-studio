import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// Reset URL/localStorage between tests so auth/store tests don't bleed.
// Guard against node environment (mock-server tests use @vitest-environment node).
beforeEach(() => {
  if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function')
    localStorage.clear();
  if (typeof sessionStorage !== 'undefined' && typeof sessionStorage.clear === 'function')
    sessionStorage.clear();
  if (typeof window !== 'undefined') window.history.replaceState(null, '', '/');
});
