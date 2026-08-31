'use client';

import { addMonths, format, subMonths } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { dailyRhythmService } from '../services/dailyRhythmService';

export interface MonthDayInfo {
  date: string;
  entryCount: number;
  hasOvercapacity: boolean;
  hasWorkouts: boolean;
}

export function useMonthlyRhythm(initialDate?: Date) {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate ?? new Date());
  const [selectedDay, setSelectedDay] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDayEntries, setSelectedDayEntries] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDay = useCallback(async (dateStr: string) => {
    setIsLoading(true);
    try {
      const result = await dailyRhythmService.getDaySchedule(dateStr);
      setSelectedDayEntries(result.entries.concat(result.unscheduled));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDay(selectedDay);
  }, [selectedDay, loadDay]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDay(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  return {
    currentMonth,
    selectedDay,
    setSelectedDay,
    selectedDayEntries,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}

