import { differenceInCalendarDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

/** Canonical stored-date key for a goal's dates (`startDate`/`targetDate`/progress `date`) — never a full ISO datetime, same convention as `features/leisure`/`features/nutrition`. */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function formatShortDate(dateKey: string): string {
  return format(fromDateKey(dateKey), "d 'de' MMM 'de' yyyy", { locale: ptBR });
}

/** For full ISO datetimes (`createdAt`/`updatedAt`) rather than a `yyyy-MM-dd` key. */
export function formatShortDateTime(isoDateTime: string): string {
  return format(new Date(isoDateTime), "d 'de' MMM", { locale: ptBR });
}

export function getDaysUntil(dateKey: string, now: Date = new Date()): number {
  return differenceInCalendarDays(fromDateKey(dateKey), now);
}
