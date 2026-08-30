'use client';

import { useSyncExternalStore } from 'react';

export interface UseRestTimerResult {
  remainingSeconds: number;
  isResting: boolean;
}

function getRemainingMs(restEndAt: string | undefined): number {
  if (!restEndAt) return 0;
  return new Date(restEndAt).getTime() - Date.now();
}

function getRemainingSeconds(restEndAt: string | undefined): number {
  if (!restEndAt) return 0;
  return Math.max(0, Math.ceil(getRemainingMs(restEndAt) / 1000));
}

function getIsResting(restEndAt: string | undefined): boolean {
  return restEndAt !== undefined && getRemainingMs(restEndAt) > 0;
}

function subscribe(callback: () => void): () => void {
  const interval = setInterval(callback, 250);
  return () => clearInterval(interval);
}

/**
 * `useSyncExternalStore` — the documented React pattern for bridging a mutable, time-based
 * external source (the wall clock, via `Date.now()`) into a component without violating render
 * purity: `getRemainingSeconds`/`getIsResting` are the "snapshot" functions, only ever invoked by
 * React's subscription machinery, never during the component's own render body. Each returns a
 * primitive (not a new object) so React can bail out of re-rendering when the rounded value hasn't
 * actually changed between 250ms ticks — remaining time is always recomputed from the absolute
 * `restEndAt` timestamp, never an accumulator that could drift. A hard refresh mid-rest resumes at
 * the exact correct second because `restEndAt` reloads verbatim from `activeWorkoutSessionStorage`.
 */
export function useRestTimer(restEndAt: string | undefined): UseRestTimerResult {
  const remainingSeconds = useSyncExternalStore(subscribe, () => getRemainingSeconds(restEndAt));
  const isResting = useSyncExternalStore(subscribe, () => getIsResting(restEndAt));
  return { remainingSeconds, isResting };
}
