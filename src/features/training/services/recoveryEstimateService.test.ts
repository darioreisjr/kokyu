import { beforeEach, describe, expect, it } from 'vitest';

import { muscleGroupOptions } from '../constants/muscleGroups';
import { recoveryEstimateService } from './recoveryEstimateService';
import { resetTrainingDb, trainingDb } from './trainingMockDb';

describe('recoveryEstimateService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('returns one recovery estimate per muscle group', async () => {
    const overview = await recoveryEstimateService.getRecoveryOverview();
    expect(overview).toHaveLength(muscleGroupOptions.length);
    expect(overview.map((entry) => entry.muscleGroup)).toEqual(
      expect.arrayContaining(muscleGroupOptions.map((option) => option.value)),
    );
  });

  it('gives a muscle group with recent direct sets a lower recovery percent than one never trained', async () => {
    const overview = await recoveryEstimateService.getRecoveryOverview();
    const chest = overview.find((entry) => entry.muscleGroup === 'chest');
    const adductors = overview.find((entry) => entry.muscleGroup === 'adductors');
    expect(chest?.estimatedRecoveryPercent).toBeLessThan(adductors?.estimatedRecoveryPercent ?? 0);
    expect(adductors?.label).toBe('wellRested');
  });

  it('getLatestCheckIn returns the most recently dated check-in', async () => {
    const latest = await recoveryEstimateService.getLatestCheckIn();
    expect(latest?.id).toBe('recovery-checkin-1');
  });

  it('getLatestCheckIn returns null when there are no check-ins', async () => {
    trainingDb.recoveryCheckIns = [];
    const latest = await recoveryEstimateService.getLatestCheckIn();
    expect(latest).toBeNull();
  });

  it('getCheckInHistory without a range returns every check-in, most recent first', async () => {
    const history = await recoveryEstimateService.getCheckInHistory();
    expect(history).toHaveLength(2);
    expect(history[0]?.id).toBe('recovery-checkin-1');
  });

  it('getCheckInHistory with a range excludes older check-ins', async () => {
    const history = await recoveryEstimateService.getCheckInHistory(2);
    expect(history.every((checkIn) => checkIn.id === 'recovery-checkin-1')).toBe(true);
  });

  it('submitRecoveryCheckIn adds a new check-in that becomes the latest', async () => {
    const submitted = await recoveryEstimateService.submitRecoveryCheckIn({
      date: '2026-08-29',
      energyLevel: 5,
      disposition: 5,
      muscleSoreness: 1,
    });
    expect(submitted.id).toBeTruthy();

    const latest = await recoveryEstimateService.getLatestCheckIn();
    expect(latest?.id).toBe(submitted.id);
  });
});
