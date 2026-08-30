'use client';

import { useEffect, useState } from 'react';

import { calculateGoalProgress } from '../services/goalProgressEngine';
import type { GoalProgressResult } from '../services/progressStrategies';
import type { Goal } from '../types';
import type { LoadStatus } from './useGoals';

export interface UseGoalsProgressMapResult {
  status: LoadStatus;
  progressByGoalId: Record<string, GoalProgressResult>;
}

/**
 * Bulk version of `useGoalProgress`, for list pages — always call with the *raw* list from
 * `useGoals()`, never a filtered/sorted derived array recreated on every render, or this effect
 * would refetch on every render (a new array reference, even with identical goals inside, is a
 * new dependency to React).
 */
export function useGoalsProgressMap(goals: Goal[]): UseGoalsProgressMapResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [progressByGoalId, setProgressByGoalId] = useState<Record<string, GoalProgressResult>>({});

  useEffect(() => {
    if (goals.length === 0) {
      queueMicrotask(() => {
        setStatus('ready');
        setProgressByGoalId({});
      });
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all(goals.map(async (goal) => [goal.id, await calculateGoalProgress(goal)] as const))
      .then((entries) => {
        if (cancelled) return;
        setProgressByGoalId(Object.fromEntries(entries));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [goals]);

  return { status, progressByGoalId };
}
