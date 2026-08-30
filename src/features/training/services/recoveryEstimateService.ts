import { muscleGroupOptions } from '../constants/muscleGroups';
import type { MuscleRecoveryEstimate, RecoveryCheckIn, RecoveryCheckInInput } from '../types';
import { calculateSessionMuscleVolume } from './muscleVolumeCalculator';
import { estimateMuscleRecovery } from './recoveryEstimateEngine';
import { generateId, trainingDb } from './trainingMockDb';

const RECENT_WINDOW_DAYS = 7;

export const recoveryEstimateService = {
  async getRecoveryOverview(): Promise<MuscleRecoveryEstimate[]> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const completedSessions = trainingDb.sessions
      .filter((session) => session.status === 'completed')
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    const latestCheckIn = await recoveryEstimateService.getLatestCheckIn();

    return muscleGroupOptions.map(({ value: muscleGroup }) => {
      let lastTrainedAt: string | undefined;
      let recentDirectSets = 0;

      for (const session of completedSessions) {
        const setsForSession = trainingDb.performedSets.filter(
          (set) => set.sessionId === session.id,
        );
        const volume = calculateSessionMuscleVolume(
          session.sessionExercises,
          setsForSession,
          trainingDb.exercises,
        );
        const entry = volume.find((item) => item.muscleGroup === muscleGroup);
        if (!entry) continue;
        if (!lastTrainedAt) lastTrainedAt = session.startedAt;
        if (new Date(session.startedAt) >= windowStart) recentDirectSets += entry.directSets;
      }

      const hoursSinceTrained = lastTrainedAt
        ? (now.getTime() - new Date(lastTrainedAt).getTime()) / (60 * 60 * 1000)
        : undefined;

      return {
        ...estimateMuscleRecovery(
          muscleGroup,
          hoursSinceTrained,
          recentDirectSets,
          latestCheckIn ?? undefined,
        ),
        lastTrainedAt,
      };
    });
  },

  async getLatestCheckIn(): Promise<RecoveryCheckIn | null> {
    const sorted = [...trainingDb.recoveryCheckIns].sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted[0] ?? null;
  },

  async getCheckInHistory(rangeDays?: number): Promise<RecoveryCheckIn[]> {
    const sorted = [...trainingDb.recoveryCheckIns].sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (!rangeDays) return sorted;
    const cutoff = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);
    return sorted.filter((checkIn) => new Date(checkIn.date) >= cutoff);
  },

  async submitRecoveryCheckIn(input: RecoveryCheckInInput): Promise<RecoveryCheckIn> {
    const checkIn: RecoveryCheckIn = {
      ...input,
      id: generateId('recovery-checkin'),
      createdAt: new Date().toISOString(),
    };
    trainingDb.recoveryCheckIns.push(checkIn);
    return checkIn;
  },
};
