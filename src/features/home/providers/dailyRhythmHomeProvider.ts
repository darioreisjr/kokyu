import { dailyRhythmService } from '@/features/daily-rhythm/services/dailyRhythmService';
import type {
  DailyRhythmHomeProjection,
  HomeProviderContext,
  HomeSectionProvider,
} from '@/shared/home/types';

function toHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * The schedule half of Respiração — reads `dailyRhythmService.getDaySchedule`
 * (the exact same call `/app/ritmo-diario` itself makes) rather than a
 * copy of the day's entries. "Current"/"next" aren't returned by that
 * service directly, so this provider derives them the same way
 * `NowIndicator`/`DailyTimeline` do for rendering (see
 * `docs/respiration-home.md`).
 */
export const dailyRhythmHomeProvider: HomeSectionProvider<DailyRhythmHomeProjection> = {
  sourceType: 'dailyRhythm',
  label: 'Ritmo Diário',

  async getHomeProjection(context: HomeProviderContext): Promise<DailyRhythmHomeProjection> {
    const daySchedule = await dailyRhythmService.getDaySchedule(context.date, {
      dayStartsAt: context.dayStartsAt,
      dayEndsAt: context.dayEndsAt,
    });

    const nowHHmm = toHHmm(context.now);
    const isOpen = (status: string) => status !== 'completed' && status !== 'cancelled' && status !== 'skipped';

    const currentEntry =
      daySchedule.entries.find(
        (entry) =>
          entry.startAt && entry.endAt && entry.startAt <= nowHHmm && entry.endAt > nowHHmm && isOpen(entry.status),
      ) ?? null;

    const nextEntries = daySchedule.entries
      .filter((entry) => entry.startAt && entry.startAt > nowHHmm && isOpen(entry.status))
      .slice(0, 4);

    return {
      currentEntry,
      nextEntries,
      freeSlots: daySchedule.freeSlots,
      capacity: daySchedule.capacity,
      conflicts: daySchedule.conflicts,
      unscheduledCount: daySchedule.unscheduled.length,
      hasAnyEntry: daySchedule.entries.length > 0 || daySchedule.unscheduled.length > 0,
    };
  },
};
