'use client';

import { useCallback, useEffect, useState } from 'react';
import { missionService } from '../services/missionService';
import type { Mission } from '../types';

export function useInboxMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    missionService.getInboxMissions().then((data) => {
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
    setReloadKey((k) => k + 1);
  }, []);

  return { missions, isLoading, refresh };
}
