import { addDays, format } from 'date-fns';

/** The local `yyyy-MM-dd` key every Mission date field is stored/compared as — same convention as `features/leisure/utils/dateHelpers.ts`, kept local so `missions` doesn't cross-import another feature's utils. */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function offsetFromToday(days: number): string {
  return toDateKey(addDays(new Date(), days));
}
