import { describe, expect, it } from 'vitest';
import type { ScheduleEntry } from '../types';
import { calculateDailyCapacity } from './dailyCapacityEngine';

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

describe('dailyCapacityEngine', () => {
  it('calculates available capacity and workload accurately', () => {
    // 08:00 - 18:00 = 10h = 600 min
    // Fixed: 2h = 120 min -> Available = 480 min
    // Planned flexible: 4h = 240 min -> Utilization = 50% (balanced)
    const entries = [
      createEntry({ id: '1', title: 'Reunião Fixa', duration: 120, locked: true }),
      createEntry({ id: '2', title: 'Missão Flexível', duration: 240, locked: false }),
    ];

    const capacity = calculateDailyCapacity('2026-08-31', entries, {
      dayStartsAt: '08:00',
      dayEndsAt: '18:00',
    });

    expect(capacity.totalDayDurationMinutes).toBe(600);
    expect(capacity.fixedBlockedMinutes).toBe(120);
    expect(capacity.availableMinutes).toBe(480);
    expect(capacity.plannedWorkloadMinutes).toBe(240);
    expect(capacity.utilizationPercent).toBe(50);
    expect(capacity.status).toBe('balanced');
    expect(capacity.differenceMinutes).toBe(-240);
  });

  it('detects overcapacity (prompt example: Available: 5h30, Planned: 7h15 -> Over by 1h45)', () => {
    // Total available: 330 min (5h30)
    // Planned: 435 min (7h15)
    // Diff: 105 min (1h45)
    const entries = [
      createEntry({ id: '1', title: 'Tarefas', duration: 435, locked: false }),
    ];

    const capacity = calculateDailyCapacity('2026-08-31', entries, {
      dayStartsAt: '08:00',
      dayEndsAt: '13:30', // 5h30 = 330 min
    });

    expect(capacity.availableMinutes).toBe(330);
    expect(capacity.plannedWorkloadMinutes).toBe(435);
    expect(capacity.status).toBe('overcapacity');
    expect(capacity.differenceMinutes).toBe(105);
  });
});

