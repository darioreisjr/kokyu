'use client';

import { useCallback, useEffect, useState } from 'react';

import { sessionService } from '../services/sessionService';
import type { PerformedSet, WorkoutSession } from '../types';
import type { LoadStatus } from './useWorkoutHistory';

export interface UseWorkoutSessionResult {
  status: LoadStatus;
  session: WorkoutSession | null;
  performedSets: PerformedSet[];
  reload: () => void;
}

export function useWorkoutSession(id: string): UseWorkoutSessionResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [performedSets, setPerformedSets] = useState<PerformedSet[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([sessionService.getWorkoutSession(id), sessionService.getPerformedSets(id)])
      .then(([loadedSession, loadedSets]) => {
        if (cancelled) return;
        setSession(loadedSession);
        setPerformedSets(loadedSets);
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

  return { status, session, performedSets, reload };
}
