import { beforeEach, describe, expect, it } from 'vitest';
import { resetLeisureDb } from '@/features/leisure/services/leisureMockDb';
import { leisurePlanService } from '@/features/leisure/services/leisurePlanService';
import type { HomeProviderContext } from '@/shared/home/types';
import { leisureHomeProvider } from './leisureHomeProvider';

function buildContext(date: string): HomeProviderContext {
  return { date, now: new Date(), dayStartsAt: '06:00', dayEndsAt: '23:00', weekStartsOn: 1 };
}

describe('leisureHomeProvider', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('surfaces a daily entry anchored on an earlier date as plannedToday for a later date', async () => {
    // The whole point of this fix: a daily/weekly series isn't only
    // "planned" on the literal date it was created for.
    await leisurePlanService.createPlanEntry({
      title: 'Alongar',
      date: '2026-01-01',
      recurrence: 'daily',
    });

    const projection = await leisureHomeProvider.getHomeProjection(buildContext('2026-01-05'));

    expect(projection.plannedToday?.title).toBe('Alongar');
  });

  it('does not surface a non-recurring entry planned for a different day', async () => {
    await leisurePlanService.createPlanEntry({ title: 'Ver filme', date: '2026-01-01' });

    const projection = await leisureHomeProvider.getHomeProjection(buildContext('2026-01-05'));

    expect(projection.plannedToday).toBeNull();
  });

  it('never surfaces an already-completed occurrence', async () => {
    const entry = await leisurePlanService.createPlanEntry({
      title: 'Alongar',
      date: '2026-01-01',
      recurrence: 'daily',
    });
    await leisurePlanService.completePlanEntry(entry.id, '2026-01-05');

    const projection = await leisureHomeProvider.getHomeProjection(buildContext('2026-01-05'));

    expect(projection.plannedToday).toBeNull();
  });
});
