'use client';

import { useCallback, useEffect, useState } from 'react';
import { missionProjectService } from '../services/missionProjectService';
import type { MissionProject } from '../types';

export function useMissionProjects() {
  const [projects, setProjects] = useState<MissionProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    missionProjectService.getProjects().then((data) => {
      if (!cancelled) {
        setProjects(data);
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

  return { projects, isLoading, refresh };
}
