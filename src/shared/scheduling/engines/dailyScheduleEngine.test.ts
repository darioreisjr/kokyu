import { describe, expect, it } from 'vitest';
import type { ScheduleEntry } from '../types';
import { generateDailySchedulePlan } from './dailyScheduleEngine';

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

describe('dailyScheduleEngine', () => {
  it('never moves locked events and schedules flexible items around them', () => {
    const fixedEntry = createEntry({
      id: 'fixed-1',
      title: 'Reunião Fixa',
      startAt: '10:00',
      endAt: '11:00',
      duration: 60,
      locked: true,
    });

    const flexibleItem = createEntry({
      id: 'flex-1',
      title: 'Desenvolvimento',
      duration: 60,
      locked: false,
      priority: 'high',
    });

    const preview = generateDailySchedulePlan(
      '2026-08-31',
      [fixedEntry],
      [flexibleItem],
      { dayStartsAt: '08:00', dayEndsAt: '18:00', bufferMinutes: 0 },
    );

    expect(preview.items).toHaveLength(2);
    const placedFixed = preview.items.find((i) => i.entryId === 'fixed-1');
    const placedFlex = preview.items.find((i) => i.entryId === 'flex-1');
    const flexDiff = preview.diffs.find((d) => d.entryId === 'flex-1');

    expect(placedFixed?.startAt).toBe('10:00');
    expect(placedFixed?.locked).toBe(true);

    // Flexible item fits at 08:00 (first free slot before fixed event)
    expect(placedFlex?.startAt).toBe('08:00');
    expect(placedFlex?.endAt).toBe('09:00');
    expect(flexDiff?.reason).toBeDefined();
  });

  it('respects buffer between scheduled events', () => {
    const fixedEntry = createEntry({
      id: 'fixed-1',
      startAt: '09:00',
      endAt: '10:00',
      duration: 60,
      locked: true,
    });

    const itemA = createEntry({ id: 'a', title: 'A', duration: 60, priority: 'high' });
    const itemB = createEntry({ id: 'b', title: 'B', duration: 60, priority: 'medium' });

    const preview = generateDailySchedulePlan(
      '2026-08-31',
      [fixedEntry],
      [itemA, itemB],
      { dayStartsAt: '10:00', dayEndsAt: '18:00', bufferMinutes: 15 },
    );

    const placedA = preview.items.find((i) => i.entryId === 'a');
    const placedB = preview.items.find((i) => i.entryId === 'b');

    // Slot begins after fixedEntry (10:00) + 15 min buffer = 10:15
    expect(placedA?.startAt).toBe('10:15');
    expect(placedA?.endAt).toBe('11:15');

    // Item B starts after 11:15 + 15 min buffer = 11:30
    expect(placedB?.startAt).toBe('11:30');
    expect(placedB?.endAt).toBe('12:30');
  });

  it('collects unplaced items if available time is insufficient', () => {
    const largeItem = createEntry({
      id: 'huge',
      title: 'Workshop',
      duration: 300, // 5 hours
      splittable: false,
    });

    const preview = generateDailySchedulePlan(
      '2026-08-31',
      [],
      [largeItem],
      { dayStartsAt: '08:00', dayEndsAt: '10:00' }, // only 2 hours available
    );

    const unplaced = preview.items.filter((i) => !i.startAt);
    expect(unplaced).toHaveLength(1);
    expect(unplaced[0]!.entryId).toBe('huge');
  });
});

