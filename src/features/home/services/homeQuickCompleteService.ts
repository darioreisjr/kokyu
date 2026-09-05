import { habitService } from '@/features/habits/services/habitService';
import { missionService } from '@/features/missions/services/missionService';

/**
 * "Mission Quick Complete"/"Habit Quick Complete" (spec) — thin wrappers
 * over the official services so `HomeFocus`/`HomeHabitSummary`
 * never write to a store directly. Habits only support the binary case
 * here (see `HomeHabitSummary.canQuickComplete`) — anything needing a
 * quantity/duration input opens the real feature instead.
 */
export const homeQuickCompleteService = {
  async completeMission(id: string): Promise<boolean> {
    const updated = await missionService.completeMission(id);
    return updated !== null;
  },

  async completeHabit(habitId: string, date: string): Promise<void> {
    await habitService.createHabitLog({
      habitId,
      date,
      status: 'completed',
      value: 1,
      source: 'manual',
    });
  },
};
