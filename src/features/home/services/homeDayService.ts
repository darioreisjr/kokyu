import { toDateKey } from '@/features/leisure/utils/dateHelpers';
import { formatDurationDisplay, getTimeOfDay, timeToMinutes } from '@/shared/scheduling/utils/timeHelpers';
import type { HomeDayProgress } from '@/shared/home/types';

/**
 * The logical "today" for Respiração — same local `yyyy-MM-dd` convention
 * every other feature uses (`toDateKey`/`fromDateKey`, from `features/leisure`,
 * already the cross-feature precedent `daily-rhythm` reuses). There's no
 * timezone-aware day-rollover anywhere else in the app (see
 * `docs/respiration-home.md`), so Home doesn't invent one either — it
 * would just disagree with every provider it aggregates.
 */
export function getLogicalToday(): string {
  return toDateKey(new Date());
}

/**
 * Where "now" sits inside the day's awake window (`routine.dayStartsAt`/
 * `dayEndsAt`) — a fact, never a productivity score. Clamped to [0, total]
 * so a snapshot generated before the day starts or after it ends still
 * renders a sane bar instead of a negative/over-100% one.
 */
export function computeDayProgress(now: Date, dayStartsAt: string, dayEndsAt: string): HomeDayProgress {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(dayStartsAt);
  const endMinutes = timeToMinutes(dayEndsAt);
  const totalMinutes = Math.max(endMinutes - startMinutes, 1);
  const elapsedMinutes = Math.min(Math.max(nowMinutes - startMinutes, 0), totalMinutes);
  const percent = Math.round((elapsedMinutes / totalMinutes) * 100);

  return { totalMinutes, elapsedMinutes, percent };
}

export type HomeDayMoment = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Drives the "Morning Mode" contextual ordering (spec's MANHÃ/DURANTE O
 * DIA/NOITE) — reuses the existing `getTimeOfDay` categorization from
 * scheduling instead of a second morning/afternoon/evening cutoff table.
 */
export function getDayMoment(now: Date): HomeDayMoment {
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return getTimeOfDay(`${hh}:${mm}`);
}

export function formatMinutesForHome(minutes: number): string {
  return formatDurationDisplay(minutes);
}
