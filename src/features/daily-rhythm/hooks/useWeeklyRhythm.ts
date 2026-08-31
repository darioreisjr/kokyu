'use client';

import { addDays, subDays } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { getWeekStart } from '@/features/leisure/utils/dateHelpers';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import {
  weeklyPlanningService,
  type WeeklyScheduleResult,
} from '../services/weeklyPlanningService';

export function useWeeklyRhythm(initialDate?: Date) {
  const { preferences } = usePreferences();
  const weekStartsOn = preferences.locale.weekStartsOn;

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getWeekStart(initialDate ?? new Date(), weekStartsOn),
  );
  const [weeklyData, setWeeklyData] = useState<WeeklyScheduleResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadWeekly = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await weeklyPlanningService.getWeeklySchedule(
        currentWeekStart,
        weekStartsOn,
      );
      setWeeklyData(data);
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart, weekStartsOn]);

  useEffect(() => {
    loadWeekly();
  }, [loadWeekly]);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => subDays(prev, 7));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date(), weekStartsOn));
  }, [weekStartsOn]);

  return {
    currentWeekStart,
    weeklyData,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    refreshWeekly: loadWeekly,
  };
}

