'use client';

import { useCallback, useEffect, useState } from 'react';
import { missionService } from '../services/missionService';
import type { Mission } from '../types';

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    missionService.getMissions().then((data) => {
      if (!cancelled) {
        setMissions(data);
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

  return { missions, isLoading, refresh };
}
