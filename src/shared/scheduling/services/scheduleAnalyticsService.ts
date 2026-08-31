import { SCHEDULE_SOURCE_METAS, SCHEDULING_CONFIG } from '../constants/schedulingConstants';
import type {
  EstimationAccuracy,
  FocusAnalytics,
  PlannedVsActual,
  RescheduleRate,
  ScheduleAnalytics,
  ScheduleEntry,
  TimeByArea,
  TimeBySource,
} from '../types';
import { calculateDurationMinutes } from '../utils/timeHelpers';
import { scheduleDb } from './scheduleMockDb';

export const scheduleAnalyticsService = {
  calculateAnalytics(
    entries: ScheduleEntry[],
    focusSessions = scheduleDb.focusHistory,
    period: 'day' | 'week' | 'month' = 'day',
  ): ScheduleAnalytics {
    // 1. Group entries by date
    const dateMap = new Map<string, ScheduleEntry[]>();
    for (const entry of entries) {
      const list = dateMap.get(entry.date) ?? [];
      list.push(entry);
      dateMap.set(entry.date, list);
    }

    const plannedVsActual: PlannedVsActual[] = [];
    for (const [date, dateEntries] of dateMap.entries()) {
      let plannedMinutes = 0;
      let actualMinutes = 0;
      let completedCount = 0;

      for (const e of dateEntries) {
        if (e.status !== 'cancelled' && e.status !== 'skipped') {
          plannedMinutes += e.duration;
        }

        if (e.status === 'completed') {
          completedCount += 1;
          if (e.actualStart && e.actualEnd) {
            actualMinutes += calculateDurationMinutes(e.actualStart, e.actualEnd);
          } else {
            actualMinutes += e.duration;
          }
        }
      }

      const totalActive = dateEntries.filter(
        (e) => e.status !== 'cancelled' && e.status !== 'skipped',
      ).length;

      const completionRatePercent =
        totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

      plannedVsActual.push({
        date,
        plannedMinutes,
        actualMinutes,
        differenceMinutes: actualMinutes - plannedMinutes,
        completionRatePercent,
      });
    }

    // 2. Time by Source
    const sourceMinutesMap = new Map<string, number>();
    let totalSourceMinutes = 0;

    for (const e of entries) {
      if (e.status !== 'cancelled' && e.status !== 'skipped') {
        const current = sourceMinutesMap.get(e.sourceType) ?? 0;
        sourceMinutesMap.set(e.sourceType, current + e.duration);
        totalSourceMinutes += e.duration;
      }
    }

    const timeBySource: TimeBySource[] = Array.from(sourceMinutesMap.entries()).map(
      ([sourceType, minutes]) => {
        const meta = SCHEDULE_SOURCE_METAS[sourceType as keyof typeof SCHEDULE_SOURCE_METAS];
        const percentage =
          totalSourceMinutes > 0 ? Math.round((minutes / totalSourceMinutes) * 100) : 0;
        return {
          sourceType: sourceType as any,
          label: meta?.label ?? sourceType,
          minutes,
          percentage,
          colorToken: meta?.colorTokenKey,
        };
      },
    );

    // 3. Time by Area / Context
    const areaMinutesMap = new Map<string, number>();
    for (const e of entries) {
      if (e.status !== 'cancelled' && e.status !== 'skipped') {
        const area = e.context ?? 'personal';
        const current = areaMinutesMap.get(area) ?? 0;
        areaMinutesMap.set(area, current + e.duration);
      }
    }

    const areaLabels: Record<string, string> = {
      work: 'Trabalho',
      personal: 'Pessoal',
      health: 'Saúde e Treino',
      leisure: 'Tempo Livre',
      custom: 'Outro',
    };

    const timeByArea: TimeByArea[] = Array.from(areaMinutesMap.entries()).map(([area, minutes]) => ({
      area,
      label: areaLabels[area] ?? area,
      minutes,
      percentage:
        totalSourceMinutes > 0 ? Math.round((minutes / totalSourceMinutes) * 100) : 0,
    }));

    // 4. Focus Analytics
    let totalFocusSeconds = 0;
    let completedFocusSessions = 0;
    let interruptedFocusSessions = 0;

    for (const session of focusSessions) {
      totalFocusSeconds += session.actualDurationSeconds;
      if (session.status === 'completed') completedFocusSessions += 1;
      if (session.interruptions && session.interruptions.length > 0) {
        interruptedFocusSessions += 1;
      }
    }

    const totalSessions = focusSessions.length;
    const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
    const averageSessionMinutes =
      totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;

    const focus: FocusAnalytics = {
      totalSessions,
      totalDurationMinutes: totalFocusMinutes,
      averageSessionMinutes,
      completedSessions: completedFocusSessions,
      interruptedSessions: interruptedFocusSessions,
    };

    // 5. Reschedule Rate
    const totalPlanned = entries.filter((e) => e.status !== 'cancelled').length;
    const rescheduledCount = entries.filter((e) => e.status === 'rescheduled').length;
    const reschedule: RescheduleRate = {
      totalPlanned,
      rescheduledCount,
      ratePercent: totalPlanned > 0 ? Math.round((rescheduledCount / totalPlanned) * 100) : 0,
    };

    // 6. Estimation Accuracy (only if sample size >= 5)
    let estimationAccuracy: EstimationAccuracy | undefined;
    const completedWithActual = entries.filter(
      (e) => e.status === 'completed' && e.actualStart && e.actualEnd,
    );

    if (completedWithActual.length >= SCHEDULING_CONFIG.sampleSizeForInsights) {
      let over = 0;
      let under = 0;
      let totalDiscrepancy = 0;

      for (const e of completedWithActual) {
        const actual = calculateDurationMinutes(e.actualStart!, e.actualEnd!);
        const planned = e.duration;
        const diff = actual - planned;
        if (diff > 0) under += 1; // took longer than estimated
        if (diff < 0) over += 1; // finished faster than estimated
        totalDiscrepancy += Math.abs(diff) / (planned || 1);
      }

      estimationAccuracy = {
        sampleSize: completedWithActual.length,
        averageDiscrepancyPercent: Math.round(
          (totalDiscrepancy / completedWithActual.length) * 100,
        ),
        overestimatedCount: over,
        underestimatedCount: under,
      };
    }

    return {
      period,
      plannedVsActual,
      timeBySource,
      timeByArea,
      focus,
      reschedule,
      estimationAccuracy,
    };
  },
};

