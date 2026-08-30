import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  setReducedMotionPreference(false);
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
