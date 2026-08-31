import type { Habit, HabitTarget } from '../../types/habit.types';
import type { HabitSchedule } from '../../types/schedule.types';

export function getDayOfWeekFromDateString(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year!, month! - 1, day!);
  return date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year!, month! - 1, day!);
}

export function isDateInRange(date: string, startDate?: string, endDate?: string): boolean {
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

export function isHabitPausedOnDate(habit: Habit, date: string): boolean {
  if (habit.status === 'paused' && !habit.plannedPause) {
    return true;
  }

  if (habit.plannedPause) {
    const { startDate, endDate } = habit.plannedPause;
    if (date >= startDate && (!endDate || date <= endDate)) {
      return true;
    }
  }

  return false;
}

export function getEffectiveScheduleAndTarget(
  habit: Habit,
  date: string,
): { schedule: HabitSchedule; target: HabitTarget } {
  if (habit.scheduleHistory && habit.scheduleHistory.length > 0) {
    const historical = habit.scheduleHistory.find((version) => {
      const { effectiveFrom, effectiveUntil } = version;
      if (effectiveFrom && date < effectiveFrom) return false;
      if (effectiveUntil && date > effectiveUntil) return false;
      return true;
    });

    if (historical) {
      return { schedule: historical.schedule, target: historical.target };
    }
  }

  return { schedule: habit.schedule, target: habit.target };
}

export function isHabitScheduledOnDate(habit: Habit, date: string): boolean {
  if (habit.status === 'archived') {
    return false;
  }

  if (isHabitPausedOnDate(habit, date)) {
    return false;
  }

  if (!isDateInRange(date, habit.startDate, habit.endDate)) {
    return false;
  }

  const { schedule } = getEffectiveScheduleAndTarget(habit, date);

  if (!isDateInRange(date, schedule.startDate, schedule.endDate)) {
    return false;
  }

  const dayOfWeek = getDayOfWeekFromDateString(date);

  switch (schedule.frequencyType) {
    case 'daily':
      return true;

    case 'specificDays':
      return schedule.weekdays?.includes(dayOfWeek) ?? false;

    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday

    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

    case 'interval': {
      const interval = schedule.intervalDays ?? 1;
      const baseDateStr = schedule.startDate ?? habit.startDate;
      const baseDate = parseDateString(baseDateStr);
      const targetDate = parseDateString(date);
      const diffTime = targetDate.getTime() - baseDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % interval === 0;
    }

    case 'flexibleWeekly':
    case 'flexibleMonthly':
      return true;

    default:
      return true;
  }
}

export function getScheduleWeekRange(
  date: string,
  weekStartsOn: 0 | 1 = 1,
): { start: string; end: string } {
  const d = parseDateString(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

  const start = new Date(d);
  start.setDate(d.getDate() - diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const format = (dateObj: Date) =>
    `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  return { start: format(start), end: format(end) };
}

export function getScheduleMonthRange(date: string): { start: string; end: string } {
  const [y, m] = date.split('-').map(Number);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y!, m!, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}
