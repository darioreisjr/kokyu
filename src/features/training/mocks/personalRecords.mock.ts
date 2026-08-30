import type { PersonalRecord } from '../types';
import { getSessionTiming, mockSessionPlans } from './sessions.mock';

function findPlan(sessionId: string) {
  const plan = mockSessionPlans.find((candidate) => candidate.sessionId === sessionId);
  if (!plan) throw new Error(`Unknown mock session id: ${sessionId}`);
  return plan;
}

/** Derived from the values authored in `performedSets.mock.ts` — kept in sync by hand since this is seed data, not a computed read. */
export function createMockPersonalRecords(referenceDate: Date = new Date()): PersonalRecord[] {
  const pushA1 = getSessionTiming(findPlan('session-push-a-1'), referenceDate);
  const pushA2 = getSessionTiming(findPlan('session-push-a-2'), referenceDate);
  const pullA1 = getSessionTiming(findPlan('session-pull-a-1'), referenceDate);
  const legsA1 = getSessionTiming(findPlan('session-legs-a-1'), referenceDate);

  return [
    {
      id: 'pr-supino-reto-max-weight',
      exerciseId: 'exercise-supino-reto',
      recordType: 'maxWeight',
      value: 72.5,
      previousValue: 70,
      achievedAt: pushA2.finishedAt.toISOString(),
      sessionId: 'session-push-a-2',
    },
    {
      id: 'pr-supino-reto-e1rm',
      exerciseId: 'exercise-supino-reto',
      recordType: 'bestEstimatedOneRepMax',
      value: 89.4,
      previousValue: 84,
      achievedAt: pushA2.finishedAt.toISOString(),
      sessionId: 'session-push-a-2',
    },
    {
      id: 'pr-supino-reto-first',
      exerciseId: 'exercise-supino-reto',
      recordType: 'maxWeight',
      value: 70,
      achievedAt: pushA1.finishedAt.toISOString(),
      sessionId: 'session-push-a-1',
    },
    {
      id: 'pr-levantamento-terra-max-weight',
      exerciseId: 'exercise-levantamento-terra',
      recordType: 'maxWeight',
      value: 100,
      achievedAt: pullA1.finishedAt.toISOString(),
      sessionId: 'session-pull-a-1',
    },
    {
      id: 'pr-barra-fixa-max-reps',
      exerciseId: 'exercise-barra-fixa',
      recordType: 'maxReps',
      value: 9,
      achievedAt: pullA1.finishedAt.toISOString(),
      sessionId: 'session-pull-a-1',
    },
    {
      id: 'pr-agachamento-livre-max-weight',
      exerciseId: 'exercise-agachamento-livre',
      recordType: 'maxWeight',
      value: 90,
      achievedAt: legsA1.finishedAt.toISOString(),
      sessionId: 'session-legs-a-1',
    },
  ];
}
