import { describe, expect, it } from 'vitest';

import type { RecoveryCheckIn } from '../types';
import { estimateMuscleRecovery } from './recoveryEstimateEngine';

describe('estimateMuscleRecovery', () => {
  it('returns full recovery when the muscle has never been trained', () => {
    const result = estimateMuscleRecovery('chest', undefined, 0);
    expect(result).toMatchObject({ label: 'wellRested', estimatedRecoveryPercent: 100 });
  });

  it('labels a muscle trained a couple hours ago as recently trained', () => {
    const result = estimateMuscleRecovery('chest', 2, 12);
    expect(result.label).toBe('recentlyTrained');
    expect(result.estimatedRecoveryPercent).toBeLessThan(40);
  });

  it('increases the estimate as more hours pass since training', () => {
    const soonerResult = estimateMuscleRecovery('chest', 10, 9);
    const laterResult = estimateMuscleRecovery('chest', 80, 9);
    expect(laterResult.estimatedRecoveryPercent).toBeGreaterThan(
      soonerResult.estimatedRecoveryPercent,
    );
  });

  it('needs more recovery time for a muscle that took more direct sets', () => {
    const lightSession = estimateMuscleRecovery('chest', 24, 3);
    const heavySession = estimateMuscleRecovery('chest', 24, 15);
    expect(heavySession.estimatedRecoveryPercent).toBeLessThan(
      lightSession.estimatedRecoveryPercent,
    );
  });

  it('blends the objective estimate with a reported check-in', () => {
    const soreCheckIn: RecoveryCheckIn = {
      id: 'checkin-1',
      date: '2026-01-01',
      energyLevel: 3,
      disposition: 3,
      muscleSoreness: 5,
      createdAt: '2026-01-01',
    };
    const withoutCheckIn = estimateMuscleRecovery('chest', 48, 9);
    const withSoreCheckIn = estimateMuscleRecovery('chest', 48, 9, soreCheckIn);
    expect(withSoreCheckIn.estimatedRecoveryPercent).toBeLessThan(
      withoutCheckIn.estimatedRecoveryPercent,
    );
  });

  it('never exceeds 100 percent regardless of how long ago training happened', () => {
    const result = estimateMuscleRecovery('chest', 10_000, 20);
    expect(result.estimatedRecoveryPercent).toBeLessThanOrEqual(100);
  });
});
