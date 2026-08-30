import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from './leisureMockDb';
import { leisurePlanService } from './leisurePlanService';

describe('leisurePlanService', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('gets plan entries within a date range', async () => {
    const entries = await leisurePlanService.getLeisurePlan('2000-01-01', '2100-01-01');
    expect(entries.length).toBeGreaterThan(0);
  });

  it('gets plan entries for one specific date', async () => {
    const created = await leisurePlanService.createPlanEntry({
      title: 'Sessão de leitura',
      date: '2030-06-10',
    });
    const entries = await leisurePlanService.getPlanEntriesForDate('2030-06-10');
    expect(entries.map((entry) => entry.id)).toContain(created.id);
  });

  it('creates a plan entry defaulting completed to false', async () => {
    const entry = await leisurePlanService.createPlanEntry({
      title: 'Filme',
      date: '2030-06-11',
      leisureItemId: 'movie-interestelar',
    });
    expect(entry.completed).toBe(false);
  });

  it('updates a plan entry', async () => {
    const entry = await leisurePlanService.createPlanEntry({ title: 'Filme', date: '2030-06-11' });
    const updated = await leisurePlanService.updatePlanEntry(entry.id, { startTime: '20:00' });
    expect(updated?.startTime).toBe('20:00');
  });

  it('deletes a plan entry', async () => {
    const entry = await leisurePlanService.createPlanEntry({ title: 'Filme', date: '2030-06-11' });
    await leisurePlanService.deletePlanEntry(entry.id);
    expect(await leisurePlanService.getPlanEntriesForDate('2030-06-11')).toHaveLength(0);
  });

  it('marks a plan entry as completed', async () => {
    const entry = await leisurePlanService.createPlanEntry({ title: 'Filme', date: '2030-06-11' });
    const completed = await leisurePlanService.completePlanEntry(entry.id);
    expect(completed?.completed).toBe(true);
  });
});
