'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ExerciseHistoryEntry } from '../services/sessionService';
import { sessionService } from '../services/sessionService';
import type { LoadStatus } from './useExercises';

export interface UseExerciseHistoryResult {
  status: LoadStatus;
  history: ExerciseHistoryEntry[];
  reload: () => void;
}

export function useExerciseHistory(exerciseId: string): UseExerciseHistoryResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    sessionService
      .getExerciseHistory(exerciseId)
      .then((loaded) => {
        if (cancelled) return;
        setHistory(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, history, reload };
}
