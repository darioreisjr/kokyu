'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import type {
  DailyPriority,
  PendingItem,
  PlanPreview,
  ScheduleEntry,
} from '@/shared/scheduling/types';
import { dailyPlanningService } from '../services/dailyPlanningService';
import { dailyRhythmService } from '../services/dailyRhythmService';

export function useDailyPlanning(targetDate: string, onCompleted?: () => void) {
  const { preferences } = usePreferences();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [yesterdayPending, setYesterdayPending] = useState<PendingItem[]>([]);
  const [fixedCommitments, setFixedCommitments] = useState<ScheduleEntry[]>([]);
  const [priorities, setPriorities] = useState<DailyPriority[]>([]);
  const [candidateItems, setCandidateItems] = useState<ScheduleEntry[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [planPreview, setPlanPreview] = useState<PlanPreview | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pending, fixed, prios, dayData] = await Promise.all([
        dailyPlanningService.getYesterdayPendingItems(targetDate),
        dailyPlanningService.getFixedCommitments(targetDate),
        dailyPlanningService.getDailyPriorities(targetDate),
        dailyRhythmService.getDaySchedule(targetDate),
      ]);

      setYesterdayPending(pending);
      setFixedCommitments(fixed);
      setPriorities(prios);

      const allFlexible = dayData.entries
        .concat(dayData.unscheduled)
        .filter((e) => !e.locked && e.sourceType !== 'blockedTime');

      setCandidateItems(allFlexible);
      setSelectedItemIds(allFlexible.map((e) => e.id));
    } finally {
      setIsLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const addPriority = useCallback(
    async (item: { sourceType: any; sourceId: string; title: string }) => {
      if (priorities.length >= 3) return;
      const created = await dailyPlanningService.setDailyPriority(targetDate, {
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        title: item.title,
        order: priorities.length + 1,
      });
      setPriorities((prev) => [...prev, created]);
    },
    [priorities.length, targetDate],
  );

  const removePriority = useCallback(
    async (priorityId: string) => {
      await dailyPlanningService.deleteDailyPriority(priorityId);
      setPriorities((prev) => prev.filter((p) => p.id !== priorityId));
    },
    [],
  );

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const generatePlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const selected = candidateItems.filter((i) => selectedItemIds.includes(i.id));
      const preview = await dailyPlanningService.generateAutoPlanProposal(
        targetDate,
        selected,
        {
          dayStartsAt: preferences.routine.dayStartsAt,
          dayEndsAt: preferences.routine.dayEndsAt,
        },
      );
      setPlanPreview(preview);
      return preview;
    } finally {
      setIsLoading(false);
    }
  }, [candidateItems, selectedItemIds, targetDate, preferences.routine]);

  const applyPlan = useCallback(async () => {
    if (!planPreview) return;
    setIsApplying(true);
    try {
      await dailyPlanningService.applyDailyPlan(targetDate, planPreview.items);
      onCompleted?.();
    } finally {
      setIsApplying(false);
    }
  }, [planPreview, targetDate, onCompleted]);

  const nextStep = useCallback(async () => {
    if (activeStep === 0) {
      await generatePlan();
    }
    setActiveStep((s) => Math.min(2, s + 1));
  }, [activeStep, generatePlan]);

  const prevStep = useCallback(() => setActiveStep((s) => Math.max(0, s - 1)), []);

  return {
    activeStep,
    setActiveStep,
    nextStep,
    prevStep,
    isLoading,
    isApplying,
    yesterdayPending,
    fixedCommitments,
    priorities,
    setPriorities,
    addPriority,
    removePriority,
    unscheduledCandidates: candidateItems,
    selectedItemIds,
    toggleItemSelection,
    planPreview,
    generatePlan,
    applyPlan,
  };
}

