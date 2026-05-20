import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// Reset URL/localStorage between tests so auth/store tests don't bleed.
beforeEach(() => {
  if (typeof localStorage.clear === 'function') localStorage.clear();
  if (typeof sessionStorage.clear === 'function') sessionStorage.clear();
  window.history.replaceState(null, '', '/');
});
