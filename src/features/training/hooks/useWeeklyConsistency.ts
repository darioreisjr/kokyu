'use client';

import { useEffect, useState } from 'react';

import { usePreferences } from '@/features/settings/providers/PreferencesProvider';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import type { WeeklyConsistencyEntry } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseWeeklyConsistencyResult {
  status: LoadStatus;
  weeks: WeeklyConsistencyEntry[];
}

/** Respects Settings → `locale.weekStartsOn` instead of hardcoding Monday. */
export function useWeeklyConsistency(weeksCount = 8): UseWeeklyConsistencyResult {
  const { preferences } = usePreferences();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [weeks, setWeeks] = useState<WeeklyConsistencyEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    trainingAnalyticsService
      .getWeeklyConsistency(weeksCount, preferences.locale.weekStartsOn)
      .then((loaded) => {
        if (cancelled) return;
        setWeeks(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [weeksCount, preferences.locale.weekStartsOn]);

  return { status, weeks };
}
