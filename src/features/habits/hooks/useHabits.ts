'use client';

import { useCallback, useEffect, useState } from 'react';
import { habitService } from '../services/habitService';
import type { Habit } from '../types/habit.types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    habitService.getHabits().then((data) => {
      if (!cancelled) {
        setHabits(data);
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

  return { habits, isLoading, refresh };
}
