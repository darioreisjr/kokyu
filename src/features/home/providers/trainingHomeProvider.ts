import { addDays } from 'date-fns';
import { activeWorkoutSessionStorage } from '@/features/training/services/activeWorkoutSessionStorage';
import { trainingScheduleService } from '@/features/training/services/trainingScheduleService';
import type { TrainingScheduleEntry } from '@/features/training/types';
import { fromDateKey, toDateKey } from '@/features/training/utils/dateHelpers';
import type {
  HomeProviderContext,
  HomeSectionProvider,
  HomeTrainingSummary,
  TrainingHomeProjection,
} from '@/shared/home/types';

const LOOKAHEAD_DAYS = 14;

function toSummary(entry: TrainingScheduleEntry): HomeTrainingSummary {
  return {
    id: entry.id,
    label: entry.label,
    date: entry.date,
    time: entry.time,
    status: entry.status === 'rescheduled' ? 'planned' : entry.status,
    estimatedDurationMinutes: entry.estimatedDurationMinutes,
  };
}

/**
 * Reads `trainingScheduleService` — the same service `trainingScheduleAdapter`
 * (daily-rhythm) and `TrainingTodayPage` both read — for today's session
 * and the next upcoming one, plus `activeWorkoutSessionStorage` for
 * whether a session is already in progress ("Continuar treino" vs.
 * "Iniciar treino").
 */
export const trainingHomeProvider: HomeSectionProvider<TrainingHomeProjection> = {
  sourceType: 'training',
  label: 'Treinamento',

  async getHomeProjection(context: HomeProviderContext): Promise<TrainingHomeProjection> {
    const rangeEnd = toDateKey(addDays(fromDateKey(context.date), LOOKAHEAD_DAYS));
    const entries = await trainingScheduleService.getTrainingCalendar({
      from: context.date,
      to: rangeEnd,
    });

    const todaysEntries = entries.filter((entry) => entry.date === context.date);
    const todayEntry =
      todaysEntries.find((entry) => entry.status === 'planned') ?? todaysEntries[0] ?? null;

    const nextEntry =
      entries
        .filter((entry) => entry.date > context.date && entry.status === 'planned')
        .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

    return {
      today: todayEntry ? toSummary(todayEntry) : null,
      next: nextEntry ? toSummary(nextEntry) : null,
      hasActiveSession: activeWorkoutSessionStorage.hasActive(),
    };
  },
};
