'use client';

import { useCallback, useEffect, useState } from 'react';

import { exerciseService } from '../services/exerciseService';
import type { Exercise } from '../types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseExercisesResult {
  status: LoadStatus;
  exercises: Exercise[];
  reload: () => void;
}

/** Every exercise, unfiltered — pages filter this same list client-side (`utils/exerciseFilters.ts`) rather than duplicating the fetch, same pattern as `features/goals`' `useGoals`. */
export function useExercises(): UseExercisesResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    exerciseService
      .getExercises()
      .then((loaded) => {
        if (cancelled) return;
        setExercises(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, exercises, reload };
}
