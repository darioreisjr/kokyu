import { beforeEach, describe, expect, it } from 'vitest';
import { leisureDb } from '@/features/leisure/services/leisureMockDb';
import { leisurePlanService } from '@/features/leisure/services/leisurePlanService';
import { leisureScheduleAdapter } from './leisureScheduleAdapter';

describe('leisureScheduleAdapter', () => {
  beforeEach(() => {
    leisureDb.planEntries = [];
  });

  it('fetches leisure plans into ScheduleEntry', async () => {
    const plan = await leisurePlanService.createPlanEntry({
      title: 'Assistir Série',
      date: '2026-08-31',
      startTime: '21:00',
      duration: 60,
    });

    const entries = await leisureScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.sourceType).toBe('leisure');
    expect(entries[0]!.sourceId).toBe(plan.id);
    expect(entries[0]!.title).toBe('Assistir Série');
    expect(entries[0]!.startAt).toBe('21:00');
    expect(entries[0]!.endAt).toBe('22:00');
  });

  it('toggles completion through adapter', async () => {
    await leisurePlanService.createPlanEntry({
      title: 'Leitura de Ficção',
      date: '2026-08-31',
      duration: 30,
    });

    const [entry] = await leisureScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(entry).toBeDefined();

    await leisureScheduleAdapter.onEntryCompleted!(entry!);
    const plans = await leisurePlanService.getPlanEntriesForDate('2026-08-31');
    expect(plans[0]!.completed).toBe(true);
  });

  it('reports the occurrence day (not the series anchor) for a recurring entry viewed on a later date', async () => {
    await leisurePlanService.createPlanEntry({
      title: 'Alongar',
      date: '2026-08-31',
      recurrence: 'daily',
    });

    const [entry] = await leisureScheduleAdapter.getEntriesForDate('2026-09-02');
    expect(entry).toBeDefined();
    expect(entry!.date).toBe('2026-09-02');
  });

  it('completing a recurring entry on one day never completes another day of the same series', async () => {
    await leisurePlanService.createPlanEntry({
      title: 'Alongar',
      date: '2026-08-31',
      recurrence: 'daily',
    });

    const [dayTwoEntry] = await leisureScheduleAdapter.getEntriesForDate('2026-09-01');
    await leisureScheduleAdapter.onEntryCompleted!(dayTwoEntry!);

    const [dayOneAfter] = await leisureScheduleAdapter.getEntriesForDate('2026-08-31');
    const [dayTwoAfter] = await leisureScheduleAdapter.getEntriesForDate('2026-09-01');
    expect(dayOneAfter!.status).toBe('planned');
    expect(dayTwoAfter!.status).toBe('completed');
  });
});

