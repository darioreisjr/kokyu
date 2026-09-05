import { describe, expect, it } from 'vitest';
import type {
  DailyRhythmHomeProjection,
  GoalHomeProjection,
  HomeProviderContext,
  HomeProviderResult,
  MissionHomeProjection,
  NutritionHomeProjection,
} from '@/shared/home/types';
import { getHomeAttention } from './homeAttentionService';

function success<T>(sourceType: HomeProviderResult<T>['sourceType'], data: T): HomeProviderResult<T> {
  return { sourceType, status: 'success', data };
}

const context: HomeProviderContext = {
  date: '2026-09-04',
  now: new Date('2026-09-04T10:00:00'),
  dayStartsAt: '06:00',
  dayEndsAt: '23:00',
  weekStartsOn: 1,
};

const emptyMissions: MissionHomeProjection = {
  focusToday: null,
  next: null,
  pendingCount: 0,
  completedCount: 0,
  overdue: [],
  waitingFollowUp: [],
};

const emptyGoals: GoalHomeProjection = { inFocus: [], atRisk: [], pendingCheckIns: 0 };

const emptyNutrition: NutritionHomeProjection = {
  nextMeal: null,
  plannedMealsToday: 0,
  preparedMealsToday: 0,
  pantryUrgentCount: 0,
  shoppingPendingCount: 0,
};

const emptySchedule: DailyRhythmHomeProjection = {
  currentEntry: null,
  nextEntries: [],
  freeSlots: [],
  capacity: null,
  conflicts: [],
  unscheduledCount: 0,
  hasAnyEntry: false,
};

describe('homeAttentionService', () => {
  it('returns nothing when every provider has a clean day', () => {
    const items = getHomeAttention(
      {
        missions: success('mission', emptyMissions),
        goals: success('goal', emptyGoals),
        nutrition: success('nutrition', emptyNutrition),
        schedule: success('dailyRhythm', emptySchedule),
      },
      context,
    );
    expect(items).toEqual([]);
  });

  it('skips a provider that failed instead of throwing', () => {
    const items = getHomeAttention(
      {
        missions: { sourceType: 'mission', status: 'error', data: null, error: 'boom' },
        goals: success('goal', emptyGoals),
        nutrition: success('nutrition', emptyNutrition),
        schedule: success('dailyRhythm', emptySchedule),
      },
      context,
    );
    expect(items).toEqual([]);
  });

  it('orders schedule conflict, mission overdue, and goal atRisk in the spec order', () => {
    const items = getHomeAttention(
      {
        missions: success('mission', {
          ...emptyMissions,
          overdue: [{ id: 'm1', title: 'Missão atrasada', status: 'overdue' }],
        }),
        goals: success('goal', {
          ...emptyGoals,
          atRisk: [{ id: 'g1', title: 'Meta em risco', status: 'atRisk', progressPercent: 20 }],
        }),
        nutrition: success('nutrition', emptyNutrition),
        schedule: success('dailyRhythm', {
          ...emptySchedule,
          conflicts: [
            { id: 'c1', type: 'overlap', severity: 'error', entryIds: ['a', 'b'], message: 'Conflito' },
          ],
        }),
      },
      context,
    );

    expect(items.map((item) => item.sourceType)).toEqual(['dailyRhythm', 'mission', 'goal']);
    expect(items[0]!.severity).toBe('important');
  });

  it('pluralizes pantry/shopping/check-in counts', () => {
    const items = getHomeAttention(
      {
        missions: success('mission', emptyMissions),
        goals: success('goal', { ...emptyGoals, pendingCheckIns: 2 }),
        nutrition: success('nutrition', { ...emptyNutrition, pantryUrgentCount: 1, shoppingPendingCount: 3 }),
        schedule: success('dailyRhythm', emptySchedule),
      },
      context,
    );

    const titles = items.map((item) => item.title);
    expect(titles).toContain('2 check-ins de meta pendentes');
    expect(titles).toContain('1 item da despensa vence em breve');
    expect(titles).toContain('3 itens pendentes na lista de compras');
  });
});
