'use client';

import { useCallback, useEffect, useState } from 'react';

import { routineService } from '../services/routineService';
import type { WorkoutRoutine } from '../types';
import type { LoadStatus } from './useRoutines';

export interface UseRoutineResult {
  status: LoadStatus;
  routine: WorkoutRoutine | null;
  reload: () => void;
}

export function useRoutine(id: string): UseRoutineResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    routineService
      .getRoutine(id)
      .then((loaded) => {
        if (cancelled) return;
        setRoutine(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, routine, reload };
}
