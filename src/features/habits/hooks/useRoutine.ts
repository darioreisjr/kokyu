'use client';

import { useCallback, useEffect, useState } from 'react';
import { habitService } from '../services/habitService';
import type { Habit } from '../types/habit.types';
import type { HabitRoutine } from '../types/routine.types';

export function useRoutine(routineId: string) {
  const [routine, setRoutine] = useState<HabitRoutine | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([habitService.getRoutine(routineId), habitService.getHabits()]).then(
      ([r, allHabits]) => {
        if (!cancelled && r) {
          setRoutine(r);
          setHabits(allHabits);
          setIsLoading(false);
        } else if (!cancelled) {
          setIsLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [routineId, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return { routine, habits, isLoading, refresh };
}
