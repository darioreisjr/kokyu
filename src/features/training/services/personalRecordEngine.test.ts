import { describe, expect, it } from 'vitest';

import type { PerformedSet, PersonalRecord } from '../types';
import { checkForPersonalRecords } from './personalRecordEngine';

function set(overrides: Partial<PerformedSet>): PerformedSet {
  return {
    id: 'set-1',
    sessionId: 'session-1',
    sessionExerciseId: 'se-1',
    setNumber: 1,
    setType: 'working',
    completed: true,
    ...overrides,
  };
}

describe('checkForPersonalRecords', () => {
  it('flags a new maxWeight record when no prior record exists', () => {
    const results = checkForPersonalRecords('exercise-1', [set({ weightKg: 80, reps: 8 })], []);
    const maxWeight = results.find((result) => result.recordType === 'maxWeight');
    expect(maxWeight).toMatchObject({ isNewRecord: true, newValue: 80, previousValue: undefined });
  });

  it('does not flag a record when the new value does not beat the existing one', () => {
    const existing: PersonalRecord[] = [
      {
        id: 'pr-1',
        exerciseId: 'exercise-1',
        recordType: 'maxWeight',
        value: 90,
        achievedAt: '2026-01-01',
        sessionId: 's0',
      },
    ];
    const results = checkForPersonalRecords(
      'exercise-1',
      [set({ weightKg: 80, reps: 8 })],
      existing,
    );
    const maxWeight = results.find((result) => result.recordType === 'maxWeight');
    expect(maxWeight).toMatchObject({ isNewRecord: false, newValue: 80, previousValue: 90 });
  });

  it('ignores warmup sets entirely', () => {
    const results = checkForPersonalRecords(
      'exercise-1',
      [set({ weightKg: 999, setType: 'warmup' })],
      [],
    );
    expect(results).toHaveLength(0);
  });

  it('tracks maxReps separately for bodyweight (no-load) sets', () => {
    const results = checkForPersonalRecords(
      'exercise-2',
      [set({ reps: 12, weightKg: undefined })],
      [],
    );
    const maxReps = results.find((result) => result.recordType === 'maxReps');
    expect(maxReps).toMatchObject({ isNewRecord: true, newValue: 12 });
  });

  it('computes session maxVolume as the sum of weight × reps across working sets', () => {
    const sets = [
      set({ id: 's1', weightKg: 100, reps: 10 }),
      set({ id: 's2', weightKg: 100, reps: 10 }),
    ];
    const results = checkForPersonalRecords('exercise-1', sets, []);
    const volume = results.find((result) => result.recordType === 'maxVolume');
    expect(volume?.newValue).toBe(2000);
  });

  it('produces one repPR entry per distinct rep count, tracked independently', () => {
    const existing: PersonalRecord[] = [
      {
        id: 'pr-5',
        exerciseId: 'exercise-1',
        recordType: 'repPR',
        reps: 5,
        value: 100,
        achievedAt: '2026-01-01',
        sessionId: 's0',
      },
    ];
    const sets = [
      set({ id: 's1', weightKg: 105, reps: 5 }), // beats the 5-rep PR
      set({ id: 's2', weightKg: 60, reps: 12 }), // no prior 12-rep record — new
    ];
    const results = checkForPersonalRecords('exercise-1', sets, existing);
    const repPRs = results.filter((result) => result.recordType === 'repPR');
    expect(repPRs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reps: 5, isNewRecord: true, newValue: 105, previousValue: 100 }),
        expect.objectContaining({
          reps: 12,
          isNewRecord: true,
          newValue: 60,
          previousValue: undefined,
        }),
      ]),
    );
  });

  it('returns an empty array when there are no eligible sets', () => {
    expect(checkForPersonalRecords('exercise-1', [], [])).toEqual([]);
  });
});
