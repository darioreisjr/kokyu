'use client';

import { useEffect, useState } from 'react';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import type { TrainingAnalyticsSummary } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseTrainingAnalyticsResult {
  status: LoadStatus;
  summary: TrainingAnalyticsSummary | null;
}

export function useTrainingAnalytics(): UseTrainingAnalyticsResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [summary, setSummary] = useState<TrainingAnalyticsSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    trainingAnalyticsService
      .getTrainingAnalytics()
      .then((loaded) => {
        if (cancelled) return;
        setSummary(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, summary };
}
