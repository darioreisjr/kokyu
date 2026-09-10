import { addDays, format, isSameDay as isSameDayFns, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

/**
 * The local `yyyy-MM-dd` key every `LeisurePlanEntry`/log date is
 * stored and compared as — never a full ISO datetime, which would
 * drag timezone conversion into a plain calendar date.
 */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

/** Respects Settings → Idioma e região → "A semana começa em" — never a second, independent calendar convention. */
export function getWeekStart(date: Date, weekStartsOn: 0 | 1): Date {
  return startOfWeek(date, { weekStartsOn });
}

export function getWeekDays(date: Date, weekStartsOn: 0 | 1): Date[] {
  const start = getWeekStart(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

/** "Sábado, 29 de agosto" — `date-fns` lowercases weekday names in pt-BR by convention; capitalized here since this is a heading, not running prose. */
export function formatDateHeading(date: Date): string {
  const formatted = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** "24 - 30 de agosto" within one month; "28 de ago - 3 de set" across a month boundary. */
export function formatWeekRangeHeading(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth =
    weekStart.getMonth() === weekEnd.getMonth() &&
    weekStart.getFullYear() === weekEnd.getFullYear();

  if (sameMonth) {
    return `${format(weekStart, 'd')} - ${format(weekEnd, "d 'de' MMMM", { locale: ptBR })}`;
  }
  return `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMM", { locale: ptBR })}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return isSameDayFns(a, b);
}

export function isToday(date: Date): boolean {
  return isSameDayFns(date, new Date());
}

/**
 * The date key to prefill a *new* plan entry with — never a day already
 * in the past. A week/day view can itself be showing a past date (e.g.
 * the current week's first day before today, or after navigating back),
 * and "Planejar atividade" must never hand the dialog a default that its
 * own "not in the past" rule (`buildPlanEntrySchema`) would immediately
 * reject.
 */
export function todayOrLaterKey(date: Date): string {
  const key = toDateKey(date);
  const todayKey = toDateKey(new Date());
  return key < todayKey ? todayKey : key;
}
