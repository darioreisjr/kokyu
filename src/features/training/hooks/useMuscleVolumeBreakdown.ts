'use client';

import { useEffect, useState } from 'react';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import type { MuscleVolumeEntry } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseMuscleVolumeBreakdownResult {
  status: LoadStatus;
  entries: MuscleVolumeEntry[];
}

export function useMuscleVolumeBreakdown(rangeDays = 7): UseMuscleVolumeBreakdownResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [entries, setEntries] = useState<MuscleVolumeEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    trainingAnalyticsService
      .getMuscleVolumeBreakdown(rangeDays)
      .then((loaded) => {
        if (cancelled) return;
        setEntries(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [rangeDays]);

  return { status, entries };
}
