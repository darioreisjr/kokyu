'use client';

import { useCallback, useEffect, useState } from 'react';

import type { WorkoutHistoryFilters } from '../services/sessionService';
import { sessionService } from '../services/sessionService';
import type { WorkoutSession } from '../types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseWorkoutHistoryResult {
  status: LoadStatus;
  sessions: WorkoutSession[];
  reload: () => void;
}

export function useWorkoutHistory(filters?: WorkoutHistoryFilters): UseWorkoutHistoryResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    sessionService
      .getWorkoutHistory(filters)
      .then((loaded) => {
        if (cancelled) return;
        setSessions(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters?.routineId,
    filters?.programId,
    filters?.exerciseId,
    filters?.location,
    filters?.fromDate,
    filters?.toDate,
    reloadToken,
  ]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, sessions, reload };
}
