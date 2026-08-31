import { describe, expect, it } from 'vitest';
import type { ScheduleEntry } from '../types';
import { replanRemainingDay } from './replanEngine';

function createEntry(partial: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    id: 'test-1',
    sourceType: 'mission',
    sourceId: 'm-1',
    title: 'Test',
    date: '2026-08-31',
    duration: 60,
    status: 'planned',
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
    ...partial,
  };
}

describe('replanEngine', () => {
  it('preserves completed items in morning when replanning from 15:00 onwards', () => {
    const morningCompleted = createEntry({
      id: 'morning-1',
      title: 'Treino da Manhã',
      startAt: '08:00',
      endAt: '09:00',
      duration: 60,
      status: 'completed',
    });

    const delayedItem = createEntry({
      id: 'task-1',
      title: 'Relatório',
      startAt: '14:00',
      endAt: '15:00',
      duration: 60,
      status: 'planned',
    });

    const eveningFixed = createEntry({
      id: 'dinner-1',
      title: 'Jantar',
      startAt: '19:00',
      endAt: '20:00',
      duration: 60,
      locked: true,
    });

    const result = replanRemainingDay(
      '2026-08-31',
      '15:00',
      [morningCompleted, delayedItem, eveningFixed],
      { dayStartsAt: '08:00', dayEndsAt: '22:00', bufferMinutes: 0 },
    );

    // Morning completed task is retained at 08:00
    const morningItem = result.preview.items.find((i) => i.entryId === 'morning-1');
    expect(morningItem?.startAt).toBe('08:00');

    // Delayed item is moved to 15:00 onwards
    const replanned = result.preview.items.find((i) => i.entryId === 'task-1');
    expect(replanned?.startAt).toBe('15:00');
    expect(replanned?.endAt).toBe('16:00');

    // Evening dinner stays at 19:00
    const dinner = result.preview.items.find((i) => i.entryId === 'dinner-1');
    expect(dinner?.startAt).toBe('19:00');
  });
});

