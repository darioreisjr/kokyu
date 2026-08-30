'use client';

import { useEffect, useState } from 'react';

import { calculateGoalProgress } from '../services/goalProgressEngine';
import type { GoalProgressResult } from '../services/progressStrategies';
import type { Goal } from '../types';
import type { LoadStatus } from './useGoals';

export interface UseGoalProgressResult {
  status: LoadStatus;
  progress: GoalProgressResult | null;
}

/**
 * The only place a component asks "what's this goal's progress" — always through
 * `GoalProgressEngine`, never a strategy/adapter directly, and never inline math in a component
 * (see `docs/goals.md`).
 */
export function useGoalProgress(goal: Goal | null): UseGoalProgressResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [progress, setProgress] = useState<GoalProgressResult | null>(null);

  useEffect(() => {
    if (!goal) {
      queueMicrotask(() => {
        setStatus('ready');
        setProgress(null);
      });
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    calculateGoalProgress(goal)
      .then((result) => {
        if (!cancelled) {
          setProgress(result);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [goal]);

  return { status, progress };
}
