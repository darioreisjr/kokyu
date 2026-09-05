import { beforeEach, describe, expect, it } from 'vitest';
import { habitService } from '@/features/habits/services/habitService';
import { resetHabitDb } from '@/features/habits/services/habitMockDb';
import { missionService } from '@/features/missions/services/missionService';
import { resetMissionDb } from '@/features/missions/services/missionMockDb';
import { homeQuickCompleteService } from './homeQuickCompleteService';

describe('homeQuickCompleteService', () => {
  beforeEach(() => {
    resetHabitDb();
    resetMissionDb();
  });

  it('completeMission marks the real mission as completed', async () => {
    const result = await homeQuickCompleteService.completeMission('mission-backlog-1');
    expect(result).toBe(true);

    const mission = await missionService.getMission('mission-backlog-1');
    expect(mission?.status).toBe('completed');
  });

  it('completeMission returns false for an unknown id', async () => {
    expect(await homeQuickCompleteService.completeMission('does-not-exist')).toBe(false);
  });

  it('completeHabit creates a completed manual log for the habit/date', async () => {
    const [habit] = await habitService.getHabits();
    await homeQuickCompleteService.completeHabit(habit!.id, '2026-09-04');

    const logs = await habitService.getHabitLogs(habit!.id);
    const created = logs.find((log) => log.date === '2026-09-04' && log.source === 'manual');
    expect(created?.status).toBe('completed');
  });
});
