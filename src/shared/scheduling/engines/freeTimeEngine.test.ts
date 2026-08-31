import { describe, expect, it } from 'vitest';
import type { ScheduleEntry } from '../types';
import { findFreeTimeSlots } from './freeTimeEngine';

function createEntry(partial: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    id: 'test-1',
    sourceType: 'manual',
    sourceId: 'src-1',
    title: 'Test',
    date: '2026-08-31',
    duration: 60,
    status: 'planned',
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
    ...partial,
  };
}

describe('freeTimeEngine', () => {
  it('returns full day slot when no events exist', () => {
    const slots = findFreeTimeSlots('2026-08-31', [], {
      dayStartsAt: '08:00',
      dayEndsAt: '12:00',
    });
    expect(slots).toHaveLength(1);
    expect(slots[0]!.startAt).toBe('08:00');
    expect(slots[0]!.endAt).toBe('12:00');
    expect(slots[0]!.duration).toBe(240);
  });

  it('correctly segments free slots between events (prompt example: 09:00-10:00, 11:00-12:00 within 08:00-13:00)', () => {
    const entries = [
      createEntry({ id: '1', startAt: '09:00', endAt: '10:00', duration: 60 }),
      createEntry({ id: '2', startAt: '11:00', endAt: '12:00', duration: 60 }),
    ];
    const slots = findFreeTimeSlots('2026-08-31', entries, {
      dayStartsAt: '08:00',
      dayEndsAt: '13:00',
    });

    expect(slots).toHaveLength(3);
    expect(slots[0]!.startAt).toBe('08:00');
    expect(slots[0]!.endAt).toBe('09:00');
    expect(slots[0]!.duration).toBe(60);

    expect(slots[1]!.startAt).toBe('10:00');
    expect(slots[1]!.endAt).toBe('11:00');
    expect(slots[1]!.duration).toBe(60);

    expect(slots[2]!.startAt).toBe('12:00');
    expect(slots[2]!.endAt).toBe('13:00');
    expect(slots[2]!.duration).toBe(60);
  });

  it('ignores cancelled or skipped entries', () => {
    const entries = [
      createEntry({ id: '1', startAt: '09:00', endAt: '10:00', duration: 60, status: 'cancelled' }),
      createEntry({ id: '2', startAt: '11:00', endAt: '12:00', duration: 60, status: 'skipped' }),
    ];
    const slots = findFreeTimeSlots('2026-08-31', entries, {
      dayStartsAt: '08:00',
      dayEndsAt: '13:00',
    });
    expect(slots).toHaveLength(1);
    expect(slots[0]!.startAt).toBe('08:00');
    expect(slots[0]!.endAt).toBe('13:00');
  });

  it('merges overlapping events before computing free blocks', () => {
    const entries = [
      createEntry({ id: '1', startAt: '09:00', endAt: '10:30', duration: 90 }),
      createEntry({ id: '2', startAt: '10:00', endAt: '11:30', duration: 90 }),
    ];
    const slots = findFreeTimeSlots('2026-08-31', entries, {
      dayStartsAt: '08:00',
      dayEndsAt: '13:00',
    });

    expect(slots).toHaveLength(2);
    expect(slots[0]!.startAt).toBe('08:00');
    expect(slots[0]!.endAt).toBe('09:00');
    expect(slots[1]!.startAt).toBe('11:30');
    expect(slots[1]!.endAt).toBe('13:00');
  });
});

