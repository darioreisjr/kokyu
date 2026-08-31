'use client';

import { useCallback, useEffect, useState } from 'react';
import { habitService } from '../services/habitService';
import type { HabitsOverviewAnalytics } from '../types/analytics.types';

export function useHabitAnalytics() {
  const [analytics, setAnalytics] = useState<HabitsOverviewAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    habitService.getHabitAnalyticsOverview().then((data) => {
      if (!cancelled) {
        setAnalytics(data);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return { analytics, isLoading, refresh };
}
