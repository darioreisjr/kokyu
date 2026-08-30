'use client';

import { useCallback, useEffect, useState } from 'react';

import { exerciseService } from '../services/exerciseService';
import type { Exercise } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseExerciseResult {
  status: LoadStatus;
  exercise: Exercise | null;
  reload: () => void;
}

export function useExercise(id: string): UseExerciseResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    exerciseService
      .getExercise(id)
      .then((loaded) => {
        if (cancelled) return;
        setExercise(loaded);
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

  return { status, exercise, reload };
}
