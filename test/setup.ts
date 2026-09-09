import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import type * as ApiClientModule from '@/lib/api/client';

afterEach(() => {
  cleanup();
  setReducedMotionPreference(false);
});

/**
 * Global fake backend for `/leisure/*` calls (see test/mocks/leisureApiFetchMock.ts)
 * — every other path falls through to the real `apiFetchClient`. Installed
 * here (rather than per test file) so the existing Tempo Livre test suite,
 * written against the in-memory `leisureMockDb` fixtures, keeps working
 * unchanged now that the leisure services call the real backend. A test
 * file that calls `vi.mock('@/lib/api/client', ...)` itself (e.g.
 * profileService.test.ts) overrides this for that file, same as any other
 * module mock.
 */
vi.mock('@/lib/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ApiClientModule>();
  const { mockLeisureApiFetchClient } = await import('./mocks/leisureApiFetchMock');

  return {
    ...actual,
    apiFetchClient: (path: string, init?: Parameters<typeof actual.apiFetchClient>[1]) => {
      if (path.startsWith('/leisure/')) {
        return mockLeisureApiFetchClient(path, init as { method?: string; body?: unknown });
      }
      return actual.apiFetchClient(path, init);
    },
  };
});

let reducedMotionPreferred = false;

/**
 * Lets a test simulate `prefers-reduced-motion: reduce`. Installed
 * unconditionally (not just as a jsdom fallback) because libraries
 * like `motion` capture `window.matchMedia` once at import time —
 * reassigning `window.matchMedia` from inside a test would be too
 * late for them to see it. This mock is captured instead, and reads
 * the mutable flag on every call, so toggling the flag is enough.
 */
export function setReducedMotionPreference(matches: boolean): void {
  reducedMotionPreferred = matches;
}

if (typeof window !== 'undefined') {
  window.matchMedia = (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotionPreferred : false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}
