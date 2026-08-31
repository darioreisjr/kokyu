import { beforeEach, describe, expect, it } from 'vitest';
import { resetScheduleDb, scheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { dailyPlanningService } from './dailyPlanningService';

describe('dailyPlanningService', () => {
  beforeEach(() => {
    resetScheduleDb();
  });

  it('generates proposal preview and applies plan upon confirmation', async () => {
    const today = '2026-08-31';
    const flexibleMission: ScheduleEntry = {
      id: 'plan-test-m1',
      sourceType: 'manual',
      sourceId: 'm-src-1',
      title: 'Escrever Código',
      date: today,
      duration: 60,
      status: 'planned',
      priority: 'high',
      createdAt: '2026-08-31T00:00:00Z',
      updatedAt: '2026-08-31T00:00:00Z',
    };

    const proposal = await dailyPlanningService.generateAutoPlanProposal(
      today,
      [flexibleMission],
      { dayStartsAt: '08:00', dayEndsAt: '18:00' },
    );

    expect(proposal.items.length).toBeGreaterThanOrEqual(1);
    expect(proposal.diffs.length).toBeGreaterThanOrEqual(1);

    const applied = await dailyPlanningService.applyDailyPlan(today, proposal.items);
    expect(applied.id).toBeDefined();
    expect(applied.appliedAt).toBeDefined();

    expect(scheduleDb.activities.some((a) => a.action === 'plan_applied')).toBe(true);
  });
});

