import { habitService } from '@/features/habits/services/habitService';
import type { HabitRoutine } from '@/features/habits/types';
import type {
  HabitHomeProjection,
  HomeProviderContext,
  HomeRoutineSummary,
  HomeSectionProvider,
  HomeTimeOfDay,
} from '@/shared/home/types';
import { timeToMinutes } from '@/shared/scheduling/utils/timeHelpers';

/** No routine schedule/time is guaranteed, so a `timeOfDay` bucket gets a representative clock time — good enough to sort "current vs. next", not a real scheduling engine. */
const TIME_OF_DAY_DEFAULTS: Record<HomeTimeOfDay, string | null> = {
  morning: '08:00',
  afternoon: '13:00',
  evening: '19:00',
  anytime: null,
  specific: null,
};

function estimateRoutineTime(routine: HabitRoutine): string | null {
  return routine.preferredTime ?? TIME_OF_DAY_DEFAULTS[routine.timeOfDay as HomeTimeOfDay] ?? null;
}

function toSummary(routine: HabitRoutine): HomeRoutineSummary {
  return {
    id: routine.id,
    name: routine.name,
    timeOfDay: routine.timeOfDay as HomeTimeOfDay,
    preferredTime: routine.preferredTime,
  };
}

/**
 * Reads `habitService.getHabitOccurrences` (the same derived-occurrence
 * call `TodayHabitsPage` uses) for scheduled/completed counts and the
 * next pending habit, plus `getRoutines()` for current/next routine.
 * Never a copy of `Habit`/`HabitLog` — just this projection.
 */
export const habitHomeProvider: HomeSectionProvider<HabitHomeProjection> = {
  sourceType: 'habit',
  label: 'Hábitos',

  async getHomeProjection(context: HomeProviderContext): Promise<HabitHomeProjection> {
    const [occurrences, routines] = await Promise.all([
      habitService.getHabitOccurrences(context.date, context.weekStartsOn),
      habitService.getRoutines(),
    ]);

    const scheduled = occurrences.filter((occurrence) => occurrence.isScheduled && !occurrence.isPaused);
    const completed = scheduled.filter((occurrence) => occurrence.status === 'completed');
    const pending = scheduled
      .filter((occurrence) => occurrence.status !== 'completed' && occurrence.status !== 'skipped')
      .sort((a, b) => (a.habit.preferredTime ?? '99:99').localeCompare(b.habit.preferredTime ?? '99:99'));

    const nextPending = pending[0] ?? null;

    const nowMinutes = context.now.getHours() * 60 + context.now.getMinutes();
    const activeRoutines = routines
      .filter((routine) => routine.active)
      .map((routine) => ({ routine, time: estimateRoutineTime(routine) }))
      .filter((entry): entry is { routine: HabitRoutine; time: string } => entry.time !== null)
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    let currentRoutine: HomeRoutineSummary | null = null;
    let nextRoutine: HomeRoutineSummary | null = null;

    for (const entry of activeRoutines) {
      const startMinutes = timeToMinutes(entry.time);
      const durationMinutes = entry.routine.estimatedDurationMinutes ?? 60;
      if (nowMinutes >= startMinutes && nowMinutes < startMinutes + durationMinutes) {
        currentRoutine = toSummary(entry.routine);
      } else if (startMinutes > nowMinutes && !nextRoutine) {
        nextRoutine = toSummary(entry.routine);
      }
    }

    return {
      scheduledToday: scheduled.length,
      completedToday: completed.length,
      next: nextPending
        ? {
            id: nextPending.habitId,
            name: nextPending.habit.name,
            icon: nextPending.habit.icon,
            timeOfDay: nextPending.habit.timeOfDay as HomeTimeOfDay,
            isCompleted: false,
            canQuickComplete: nextPending.habit.trackingType === 'binary',
          }
        : null,
      currentRoutine,
      nextRoutine,
    };
  },
};
