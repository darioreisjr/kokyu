'use client';

import { useEffect, useState } from 'react';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import type { TrendPoint } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseExerciseTrendResult {
  status: LoadStatus;
  trend: TrendPoint[];
}

export function useExerciseTrend(exerciseId: string): UseExerciseTrendResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    trainingAnalyticsService
      .getExerciseTrend(exerciseId)
      .then((loaded) => {
        if (cancelled) return;
        setTrend(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  return { status, trend };
}
