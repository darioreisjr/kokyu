import { beforeEach, describe, expect, it } from 'vitest';

import { personalRecordService } from './personalRecordService';
import { resetTrainingDb } from './trainingMockDb';

describe('personalRecordService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('returns every seeded personal record sorted by most recently achieved first', async () => {
    const records = await personalRecordService.getPersonalRecords();
    expect(records.length).toBeGreaterThanOrEqual(6);
    const achievedTimestamps = records.map((record) => new Date(record.achievedAt).getTime());
    expect(achievedTimestamps).toEqual([...achievedTimestamps].sort((a, b) => b - a));
  });

  it('filters records by exerciseId', async () => {
    const records = await personalRecordService.getPersonalRecords('exercise-supino-reto');
    expect(records.length).toBeGreaterThanOrEqual(2);
    expect(records.every((record) => record.exerciseId === 'exercise-supino-reto')).toBe(true);
  });

  it('returns an empty array for an exercise with no personal records', async () => {
    const records = await personalRecordService.getPersonalRecords('exercise-prancha');
    expect(records).toEqual([]);
  });
});
