'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Goal } from '../types';
import { goalService } from '../services/goalService';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseGoalsResult {
  status: LoadStatus;
  goals: Goal[];
  reload: () => void;
}

/** Every goal, unfiltered — every Metas page filters this same list client-side rather than duplicating the fetch. */
export function useGoals(): UseGoalsResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    goalService
      .getGoals()
      .then((loadedGoals) => {
        if (cancelled) return;
        setGoals(loadedGoals);
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

  return { status, goals, reload };
}
