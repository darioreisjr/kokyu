import { describe, expect, it } from 'vitest';

import {
  formatDateHeading,
  formatWeekRangeHeading,
  fromDateKey,
  getWeekDays,
  getWeekStart,
  isSameDay,
  isToday,
  toDateKey,
} from './dateHelpers';

describe('toDateKey / fromDateKey', () => {
  it('round-trips a date through its key without a timezone shift', () => {
    const date = new Date(2026, 7, 29);
    expect(toDateKey(date)).toBe('2026-08-29');
    expect(toDateKey(fromDateKey('2026-08-29'))).toBe('2026-08-29');
  });
});

describe('getWeekStart / getWeekDays', () => {
  it('starts the week on Monday when weekStartsOn is 1', () => {
    const start = getWeekStart(new Date(2026, 7, 29), 1);
    expect(toDateKey(start)).toBe('2026-08-24');
  });

  it('returns 7 consecutive days starting from the week start', () => {
    const days = getWeekDays(new Date(2026, 7, 24), 1);
    expect(days).toHaveLength(7);
    expect(toDateKey(days[0]!)).toBe('2026-08-24');
    expect(toDateKey(days[6]!)).toBe('2026-08-30');
  });
});

describe('formatDateHeading', () => {
  it('formats a capitalized weekday, day and month in pt-BR', () => {
    expect(formatDateHeading(new Date(2026, 7, 29))).toBe('Sábado, 29 de agosto');
  });
});

describe('formatWeekRangeHeading', () => {
  it('formats a range within the same month', () => {
    expect(formatWeekRangeHeading(new Date(2026, 7, 24))).toBe('24 - 30 de agosto');
  });

  it('formats a range crossing a month boundary', () => {
    expect(formatWeekRangeHeading(new Date(2026, 7, 31))).toBe('31 de ago - 6 de set');
  });
});

describe('isSameDay / isToday', () => {
  it('treats two Date instances on the same calendar day as equal', () => {
    expect(isSameDay(new Date(2026, 7, 29, 8), new Date(2026, 7, 29, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 7, 29), new Date(2026, 7, 30))).toBe(false);
  });

  it('recognizes the real current date as today', () => {
    expect(isToday(new Date())).toBe(true);
    expect(isToday(new Date(2000, 0, 1))).toBe(false);
  });
});
