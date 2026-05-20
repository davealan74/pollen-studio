import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// Reset URL/localStorage between tests so auth/store tests don't bleed.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
});
