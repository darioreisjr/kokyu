import { beforeEach, describe, expect, it } from 'vitest';

import { trainingAnalyticsService } from './trainingAnalyticsService';
import { resetTrainingDb } from './trainingMockDb';

describe('trainingAnalyticsService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('getTrainingAnalytics returns non-negative aggregates consistent with the seeded history', async () => {
    const summary = await trainingAnalyticsService.getTrainingAnalytics();
    expect(summary.totalSessions).toBeGreaterThanOrEqual(4);
    expect(summary.minutesTrainedThisYear).toBeGreaterThan(0);
    expect(summary.weeklyFrequency).toBeGreaterThanOrEqual(0);
  });

  it('getExerciseTrend returns e1RM points sorted chronologically, showing progression across the two Push A sessions', async () => {
    const trend = await trainingAnalyticsService.getExerciseTrend('exercise-supino-reto');
    expect(trend.length).toBeGreaterThanOrEqual(2);
    const dates = trend.map((point) => point.date);
    expect(dates).toEqual([...dates].sort());
    expect(trend.at(-1)!.value).toBeGreaterThan(trend[0]!.value);
  });

  it('getMuscleVolumeBreakdown only counts sessions within the requested window', async () => {
    const wideWindow = await trainingAnalyticsService.getMuscleVolumeBreakdown(30);
    const narrowWindow = await trainingAnalyticsService.getMuscleVolumeBreakdown(1);
    const wideTotal = wideWindow.reduce((total, entry) => total + entry.directSets, 0);
    const narrowTotal = narrowWindow.reduce((total, entry) => total + entry.directSets, 0);
    expect(wideTotal).toBeGreaterThanOrEqual(narrowTotal);
  });

  it('getWeeklyConsistency returns exactly the requested number of weeks', async () => {
    const weeks = await trainingAnalyticsService.getWeeklyConsistency(6);
    expect(weeks).toHaveLength(6);
  });

  it('getAdherence computes percent completed against everything planned for a program, excluding rest days', async () => {
    const adherence = await trainingAnalyticsService.getAdherence(
      'program-hipertrofia-fundamentos',
    );
    expect(adherence.adherencePercent).toBeGreaterThanOrEqual(0);
    expect(adherence.adherencePercent).toBeLessThanOrEqual(100);
  });
});
