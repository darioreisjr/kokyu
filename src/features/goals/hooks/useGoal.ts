'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Goal } from '../types';
import { goalService } from '../services/goalService';
import type { LoadStatus } from './useGoals';

export interface UseGoalResult {
  status: LoadStatus;
  goal: Goal | null;
  reload: () => void;
}

/** A single goal by id — `GoalDetailPage`/`GoalEditPage` reload after every mutation instead of guessing the new shape client-side. */
export function useGoal(id: string): UseGoalResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    goalService
      .getGoal(id)
      .then((loadedGoal) => {
        if (cancelled) return;
        setGoal(loadedGoal);
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

  return { status, goal, reload };
}
