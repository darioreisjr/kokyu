'use client';

import { useCallback, useEffect, useState } from 'react';

import { routineService } from '../services/routineService';
import type { WorkoutRoutine } from '../types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseRoutinesResult {
  status: LoadStatus;
  routines: WorkoutRoutine[];
  reload: () => void;
}

/** Every non-archived routine — pages filter this list client-side (`utils/routineFilters.ts`). */
export function useRoutines(): UseRoutinesResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    routineService
      .getRoutines({ includeArchived: true })
      .then((loaded) => {
        if (cancelled) return;
        setRoutines(loaded);
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

  return { status, routines, reload };
}
