'use client';

import { useCallback, useEffect, useState } from 'react';
import { missionService } from '../services/missionService';
import type { Mission } from '../types';

export function useMission(id: string) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    missionService.getMission(id).then((data) => {
      if (!cancelled) {
        setMission(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return { mission, isLoading, refresh };
}
