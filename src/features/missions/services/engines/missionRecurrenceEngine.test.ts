import { describe, expect, it } from 'vitest';
import type { Mission } from '../../types';
import { computeNextOccurrenceDate, generateNextOccurrence, hasRecurrenceEnded } from './missionRecurrenceEngine';

function buildRecurringMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-report',
    title: 'Enviar relatório mensal',
    status: 'completed',
    priority: 'high',
    plannedDate: '2026-08-01',
    deadline: '2026-08-05',
    contextIds: [],
    tagIds: [],
    goalIds: [],
    scheduleEntryIds: [],
    reminderIds: [],
    progressMode: 'binary',
    source: 'manual',
    replanCount: 0,
    recurrenceRule: { frequency: 'monthly', basis: 'scheduledDate' },
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    completedAt: '2026-08-01T12:00:00Z',
    ...overrides,
  };
}

describe('missionRecurrenceEngine', () => {
  it('computes the next date for every supported frequency', () => {
    expect(computeNextOccurrenceDate({ frequency: 'daily', basis: 'scheduledDate' }, '2026-09-01')).toBe('2026-09-02');
    expect(computeNextOccurrenceDate({ frequency: 'weekly', basis: 'scheduledDate' }, '2026-09-01')).toBe('2026-09-08');
    expect(computeNextOccurrenceDate({ frequency: 'monthly', basis: 'scheduledDate' }, '2026-09-01')).toBe('2026-10-01');
    expect(computeNextOccurrenceDate({ frequency: 'yearly', basis: 'scheduledDate' }, '2026-09-01')).toBe('2027-09-01');
    expect(computeNextOccurrenceDate({ frequency: 'customInterval', intervalDays: 10, basis: 'scheduledDate' }, '2026-09-01')).toBe(
      '2026-09-11',
    );
  });

  it('weekdays frequency always skips Saturday/Sunday', () => {
    // 2026-09-04 is a Friday
    expect(computeNextOccurrenceDate({ frequency: 'weekdays', basis: 'scheduledDate' }, '2026-09-04')).toBe('2026-09-07');
  });

  it('specificWeekdays picks the next matching weekday', () => {
    // 2026-09-01 is a Tuesday (2); next Monday (1) is 2026-09-07
    expect(
      computeNextOccurrenceDate({ frequency: 'specificWeekdays', weekdays: [1], basis: 'scheduledDate' }, '2026-09-01'),
    ).toBe('2026-09-07');
  });

  it('respects an explicit endDate', () => {
    const rule = { frequency: 'daily' as const, basis: 'scheduledDate' as const, endDate: '2026-09-01' };
    expect(hasRecurrenceEnded(rule, '2026-09-02', 2)).toBe(true);
    expect(hasRecurrenceEnded(rule, '2026-08-31', 2)).toBe(false);
  });

  it('respects an occurrenceCount limit', () => {
    const rule = { frequency: 'daily' as const, basis: 'scheduledDate' as const, occurrenceCount: 3 };
    expect(hasRecurrenceEnded(rule, '2026-09-02', 3)).toBe(false);
    expect(hasRecurrenceEnded(rule, '2026-09-02', 4)).toBe(true);
  });

  it('generates the next occurrence as a brand-new input, preserving the series id and the deadline offset', () => {
    const completed = buildRecurringMission();
    const next = generateNextOccurrence({ completedMission: completed, completionDate: '2026-08-01', nextOccurrenceIndex: 1 });

    expect(next).not.toBeNull();
    expect(next!.plannedDate).toBe('2026-09-01');
    expect(next!.deadline).toBe('2026-09-05'); // same 4-day planned->deadline gap preserved
    expect(next!.recurrenceSeriesId).toBe('mission-report');
    expect(next!.status).toBe('ready');
    expect(next!.source).toBe('recurrence');
    expect(next!.sourceEntityId).toBe('mission-report');
  });

  it('never mutates or overwrites the completed occurrence — it is a distinct input for a new row', () => {
    const completed = buildRecurringMission();
    const next = generateNextOccurrence({ completedMission: completed, completionDate: '2026-08-01', nextOccurrenceIndex: 1 });

    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBe('2026-08-01T12:00:00Z');
    expect(next).not.toHaveProperty('id');
    expect(next).not.toHaveProperty('completedAt');
  });

  it('uses the completion date as basis when recurrenceBasis is completionDate', () => {
    const completed = buildRecurringMission({
      recurrenceRule: { frequency: 'monthly', basis: 'completionDate' },
      plannedDate: '2026-08-01',
    });
    const next = generateNextOccurrence({ completedMission: completed, completionDate: '2026-08-20', nextOccurrenceIndex: 1 });

    expect(next!.plannedDate).toBe('2026-09-20');
  });

  it('returns null once the series has ended', () => {
    const completed = buildRecurringMission({
      recurrenceRule: { frequency: 'monthly', basis: 'scheduledDate', occurrenceCount: 1 },
    });
    const next = generateNextOccurrence({ completedMission: completed, completionDate: '2026-08-01', nextOccurrenceIndex: 2 });
    expect(next).toBeNull();
  });

  it('returns null when the mission has no recurrenceRule', () => {
    const completed = buildRecurringMission({ recurrenceRule: undefined });
    expect(generateNextOccurrence({ completedMission: completed, completionDate: '2026-08-01', nextOccurrenceIndex: 1 })).toBeNull();
  });
});
