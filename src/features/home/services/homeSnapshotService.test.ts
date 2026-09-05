import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toDateKey } from '@/features/leisure/utils/dateHelpers';
import { resetGoalDb } from '@/features/goals/services/goalMockDb';
import { resetHabitDb } from '@/features/habits/services/habitMockDb';
import { resetLeisureDb } from '@/features/leisure/services/leisureMockDb';
import { resetNutritionDb } from '@/features/nutrition/services/nutritionMockDb';
import { resetTrainingDb } from '@/features/training/services/trainingMockDb';
import { dailyRhythmService } from '@/features/daily-rhythm/services/dailyRhythmService';
import { resetScheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import { nutritionHomeProvider } from '../providers';
import { homeSnapshotService } from './homeSnapshotService';

const DAY_OPTIONS = { dayStartsAt: '06:00', dayEndsAt: '23:00', weekStartsOn: 1 as const };

describe('homeSnapshotService', () => {
  beforeEach(() => {
    resetScheduleDb();
    resetHabitDb();
    resetTrainingDb();
    resetNutritionDb();
    resetGoalDb();
    resetLeisureDb();
    vi.restoreAllMocks();
  });

  it('combines every provider into one snapshot', async () => {
    const today = toDateKey(new Date());
    const snapshot = await homeSnapshotService.getHomeSnapshot({ date: today, now: new Date(), ...DAY_OPTIONS });

    expect(snapshot.date).toBe(today);
    expect(snapshot.missions.status).toBe('success');
    expect(snapshot.habits.status).toBe('success');
    expect(snapshot.training.status).toBe('success');
    expect(snapshot.nutrition.status).toBe('success');
    expect(snapshot.goals.status).toBe('success');
    expect(snapshot.leisure.status).toBe('success');
    expect(snapshot.schedule.status).toBe('success');
    expect(snapshot.generatedAt).toBeDefined();
  });

  it('isolates a failing provider without breaking the rest of the snapshot', async () => {
    vi.spyOn(nutritionHomeProvider, 'getHomeProjection').mockRejectedValue(new Error('boom'));

    const today = toDateKey(new Date());
    const snapshot = await homeSnapshotService.getHomeSnapshot({ date: today, now: new Date(), ...DAY_OPTIONS });

    expect(snapshot.nutrition.status).toBe('error');
    expect(snapshot.nutrition.data).toBeNull();
    expect(snapshot.missions.status).toBe('success');
    expect(snapshot.schedule.status).toBe('success');
  });

  it('selects the entry covering "now" as currentEntry and a later one as a next entry', async () => {
    const today = toDateKey(new Date());
    await dailyRhythmService.createScheduleEntry({
      sourceType: 'manual',
      sourceId: 'home-test-now',
      title: 'Reunião de teste',
      date: today,
      startAt: '10:00',
      duration: 60,
      status: 'planned',
    });
    await dailyRhythmService.createScheduleEntry({
      sourceType: 'manual',
      sourceId: 'home-test-later',
      title: 'Compromisso mais tarde',
      date: today,
      startAt: '15:00',
      duration: 30,
      status: 'planned',
    });

    const now = new Date();
    now.setHours(10, 30, 0, 0);

    const snapshot = await homeSnapshotService.getHomeSnapshot({ date: today, now, ...DAY_OPTIONS });

    expect(snapshot.currentEntry?.sourceId).toBe('home-test-now');
    expect(snapshot.nextEntries.some((entry) => entry.sourceId === 'home-test-later')).toBe(true);
  });

  it("merges the mission in focus and goals in focus into dailyPriorities, capped at 5", async () => {
    const today = toDateKey(new Date());
    const snapshot = await homeSnapshotService.getHomeSnapshot({ date: today, now: new Date(), ...DAY_OPTIONS });

    expect(snapshot.dailyPriorities.length).toBeLessThanOrEqual(5);
    for (const priority of snapshot.dailyPriorities) {
      expect(['mission', 'goal']).toContain(priority.kind);
    }
  });
});
