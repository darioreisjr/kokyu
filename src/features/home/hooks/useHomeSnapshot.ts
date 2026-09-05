'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import type { HomeSnapshot } from '@/shared/home/types';
import { getLogicalToday } from '../services/homeDayService';
import { homeSnapshotService } from '../services/homeSnapshotService';

export interface UseHomeSnapshotResult {
  snapshot: HomeSnapshot | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Loads the `HomeSnapshot` for today, the same client-fetch shape
 * `useDailyRhythm` uses (load on mount, refetch on demand — there's no
 * event bus anywhere in the app to subscribe to instead, see
 * `docs/respiration-home.md`). Every quick action that changes a
 * provider's data (completing a Mission/Habit, ...) calls `refresh()`
 * afterwards rather than mutating the snapshot in place.
 */
export function useHomeSnapshot(): UseHomeSnapshotResult {
  const { preferences } = usePreferences();
  const [snapshot, setSnapshot] = useState<HomeSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await homeSnapshotService.getHomeSnapshot({
        date: getLogicalToday(),
        now: new Date(),
        dayStartsAt: preferences.routine.dayStartsAt,
        dayEndsAt: preferences.routine.dayEndsAt,
        weekStartsOn: preferences.locale.weekStartsOn,
      });
      setSnapshot(data);
    } finally {
      setIsLoading(false);
    }
  }, [preferences.routine.dayStartsAt, preferences.routine.dayEndsAt, preferences.locale.weekStartsOn]);

  useEffect(() => {
    load();
  }, [load]);

  return { snapshot, isLoading, refresh: load };
}
