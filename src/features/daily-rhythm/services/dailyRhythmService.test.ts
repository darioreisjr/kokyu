import { beforeEach, describe, expect, it } from 'vitest';
import { resetScheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import { dailyRhythmService } from './dailyRhythmService';

describe('dailyRhythmService', () => {
  beforeEach(() => {
    resetScheduleDb();
  });

  it('aggregates unified schedule entries from multiple sources', async () => {
    const today = new Date().toISOString().split('T')[0]!;
    const result = await dailyRhythmService.getDaySchedule(today);

    expect(result.date).toBe(today);
    expect(result.capacity).toBeDefined();
    expect(result.freeSlots).toBeDefined();
    expect(Array.isArray(result.entries)).toBe(true);
  });

  it('creates and updates a manual entry', async () => {
    const today = new Date().toISOString().split('T')[0]!;
    const entry = await dailyRhythmService.createScheduleEntry({
      sourceType: 'manual',
      sourceId: 'custom-1',
      title: 'Dentista',
      date: today,
      startAt: '15:00',
      duration: 60,
      locked: true,
      status: 'planned',
    });

    expect(entry.id).toBeDefined();
    expect(entry.endAt).toBe('16:00');

    const updated = await dailyRhythmService.updateScheduleEntry(entry.id, {
      startAt: '16:00',
    });
    expect(updated?.startAt).toBe('16:00');
    expect(updated?.endAt).toBe('17:00');
  });

  it('completes manual entries and updates status', async () => {
    const today = new Date().toISOString().split('T')[0]!;
    const entry = await dailyRhythmService.createScheduleEntry({
      sourceType: 'manual',
      sourceId: 'custom-2',
      title: 'Comprar remédio',
      date: today,
      startAt: '10:00',
      duration: 30,
      status: 'planned',
    });

    const success = await dailyRhythmService.completeEntry(entry);
    expect(success).toBe(true);

    const schedule = await dailyRhythmService.getDaySchedule(today);
    const found = schedule.entries.find((e) => e.id === entry.id);
    expect(found?.status).toBe('completed');
  });
});

