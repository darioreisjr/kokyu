import type {
  CompleteWorkoutInput,
  PerformedSet,
  PersonalRecord,
  PersonalRecordCheckResult,
  SessionExercise,
  WorkoutLocation,
  WorkoutSession,
} from '../types';
import { checkForPersonalRecords } from './personalRecordEngine';
import { generateId, trainingDb } from './trainingMockDb';

export interface WorkoutHistoryFilters {
  routineId?: string;
  programId?: string;
  exerciseId?: string;
  location?: WorkoutLocation;
  fromDate?: string;
  toDate?: string;
}

export interface ExerciseHistoryEntry {
  session: WorkoutSession;
  sessionExercise: SessionExercise;
  performedSets: PerformedSet[];
}

function matchesHistoryFilters(session: WorkoutSession, filters?: WorkoutHistoryFilters): boolean {
  if (!filters) return true;
  if (filters.routineId && session.routineId !== filters.routineId) return false;
  if (filters.programId && session.programId !== filters.programId) return false;
  if (
    filters.exerciseId &&
    !session.sessionExercises.some((se) => se.exerciseId === filters.exerciseId)
  )
    return false;
  if (filters.location && session.location !== filters.location) return false;
  if (filters.fromDate && session.startedAt < filters.fromDate) return false;
  if (filters.toDate && session.startedAt > filters.toDate) return false;
  return true;
}

/**
 * `completeWorkout` is the only write path into `trainingDb` for a workout session — an
 * in-progress session lives only in `activeWorkoutSessionStorage`/`TrainingSessionProvider` until
 * it's finished, so a discarded session leaves no trace here by design (see `docs/training.md`).
 */
export const sessionService = {
  async getWorkoutHistory(filters?: WorkoutHistoryFilters): Promise<WorkoutSession[]> {
    return trainingDb.sessions
      .filter((session) => session.status === 'completed')
      .filter((session) => matchesHistoryFilters(session, filters))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  async getWorkoutSession(id: string): Promise<WorkoutSession | null> {
    return trainingDb.sessions.find((session) => session.id === id) ?? null;
  },

  async getPerformedSets(sessionId: string): Promise<PerformedSet[]> {
    return trainingDb.performedSets.filter((set) => set.sessionId === sessionId);
  },

  async getExerciseHistory(exerciseId: string): Promise<ExerciseHistoryEntry[]> {
    const entries: ExerciseHistoryEntry[] = [];
    for (const session of trainingDb.sessions) {
      if (session.status !== 'completed') continue;
      const sessionExercise = session.sessionExercises.find((se) => se.exerciseId === exerciseId);
      if (!sessionExercise) continue;
      const performedSets = trainingDb.performedSets.filter(
        (set) => set.sessionExerciseId === sessionExercise.id,
      );
      entries.push({ session, sessionExercise, performedSets });
    }
    return entries.sort(
      (a, b) => new Date(b.session.startedAt).getTime() - new Date(a.session.startedAt).getTime(),
    );
  },

  async getPreviousPerformance(exerciseId: string): Promise<ExerciseHistoryEntry | null> {
    const history = await sessionService.getExerciseHistory(exerciseId);
    return history[0] ?? null;
  },

  async completeWorkout(
    input: CompleteWorkoutInput,
  ): Promise<{ session: WorkoutSession; newRecords: PersonalRecordCheckResult[] }> {
    const now = new Date().toISOString();
    const durationSeconds = Math.round(
      (new Date(input.finishedAt).getTime() - new Date(input.startedAt).getTime()) / 1000,
    );

    const newRecords: PersonalRecordCheckResult[] = [];
    const newRecordIds: string[] = [];
    const exerciseIds = [
      ...new Set(input.sessionExercises.map((sessionExercise) => sessionExercise.exerciseId)),
    ];

    for (const exerciseId of exerciseIds) {
      const sessionExerciseIds = new Set(
        input.sessionExercises.filter((se) => se.exerciseId === exerciseId).map((se) => se.id),
      );
      const setsForExercise = input.performedSets.filter((set) =>
        sessionExerciseIds.has(set.sessionExerciseId),
      );
      const existingRecords = trainingDb.personalRecords.filter(
        (record) => record.exerciseId === exerciseId,
      );
      const results = checkForPersonalRecords(exerciseId, setsForExercise, existingRecords);

      for (const result of results) {
        if (!result.isNewRecord) continue;
        const record: PersonalRecord = {
          id: generateId('pr'),
          exerciseId: result.exerciseId,
          recordType: result.recordType,
          value: result.newValue,
          reps: result.reps,
          previousValue: result.previousValue,
          achievedAt: input.finishedAt,
          sessionId: input.sessionId,
        };
        trainingDb.personalRecords.push(record);
        newRecordIds.push(record.id);
        newRecords.push(result);
      }
    }

    const session: WorkoutSession = {
      id: input.sessionId,
      routineId: input.routineId,
      programId: input.programId,
      programWeekId: input.programWeekId,
      scheduledEntryId: input.scheduledEntryId,
      name: input.name,
      startedAt: input.startedAt,
      finishedAt: input.finishedAt,
      durationSeconds,
      sessionExercises: input.sessionExercises,
      notes: input.notes,
      perceivedEffort: input.perceivedEffort,
      status: 'completed',
      location: input.location,
      newPersonalRecordIds: newRecordIds,
      createdAt: now,
      updatedAt: now,
    };
    trainingDb.sessions.push(session);
    trainingDb.performedSets.push(...input.performedSets);

    if (input.scheduledEntryId) {
      const entryIndex = trainingDb.scheduleEntries.findIndex(
        (entry) => entry.id === input.scheduledEntryId,
      );
      if (entryIndex !== -1) {
        trainingDb.scheduleEntries[entryIndex] = {
          ...trainingDb.scheduleEntries[entryIndex]!,
          status: 'completed',
          sessionId: session.id,
          updatedAt: now,
        };
      }
    }

    return { session, newRecords };
  },

  async updateWorkoutSession(
    id: string,
    patch: Partial<Pick<WorkoutSession, 'name' | 'notes' | 'perceivedEffort' | 'location'>>,
  ): Promise<WorkoutSession | null> {
    const index = trainingDb.sessions.findIndex((session) => session.id === id);
    if (index === -1) return null;
    const updated: WorkoutSession = {
      ...trainingDb.sessions[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.sessions[index] = updated;
    return updated;
  },

  async updatePerformedSet(
    id: string,
    patch: Partial<
      Pick<
        PerformedSet,
        'weightKg' | 'reps' | 'durationSeconds' | 'distanceMeters' | 'rpe' | 'rir' | 'notes'
      >
    >,
  ): Promise<PerformedSet | null> {
    const index = trainingDb.performedSets.findIndex((set) => set.id === id);
    if (index === -1) return null;
    const updated: PerformedSet = { ...trainingDb.performedSets[index]!, ...patch };
    trainingDb.performedSets[index] = updated;
    return updated;
  },

  /** Cascades to `performedSets`; derived stats (volume/PRs/frequency) are always computed live, so nothing needs a separate recalculation step. */
  async deleteWorkoutSession(id: string): Promise<void> {
    trainingDb.sessions = trainingDb.sessions.filter((session) => session.id !== id);
    trainingDb.performedSets = trainingDb.performedSets.filter((set) => set.sessionId !== id);
  },
};
