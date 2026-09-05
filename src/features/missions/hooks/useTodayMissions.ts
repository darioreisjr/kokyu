'use client';

import { useCallback, useEffect, useState } from 'react';
import { missionService } from '../services/missionService';
import type { Mission } from '../types';

export function useTodayMissions(manuallyFocusedIds: string[] = []) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    missionService.getTodayMissions(manuallyFocusedIds).then((data) => {
      if (!cancelled) {
        setMissions(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, manuallyFocusedIds.join(',')]);

  const refresh = useCallback(async () => {
    setReloadKey((k) => k + 1);
  }, []);

  return { missions, isLoading, refresh };
}
