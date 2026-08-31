'use client';

import { useCallback, useEffect, useState } from 'react';
import { habitService } from '../services/habitService';
import type { HabitRoutine } from '../types/routine.types';

export function useRoutines() {
  const [routines, setRoutines] = useState<HabitRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    habitService.getRoutines().then((data) => {
      if (!cancelled) {
        setRoutines(data);
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

  return { routines, isLoading, refresh };
}
