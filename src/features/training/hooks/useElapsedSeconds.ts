'use client';

import { useSyncExternalStore } from 'react';

function getElapsedSeconds(startedAt: string | undefined): number {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

function subscribe(callback: () => void): () => void {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

/** Same `useSyncExternalStore` approach as `useRestTimer` — counts up from `startedAt` without drift, and only reads `Date.now()` inside the snapshot function, never during render. */
export function useElapsedSeconds(startedAt: string | undefined): number {
  return useSyncExternalStore(subscribe, () => getElapsedSeconds(startedAt));
}
