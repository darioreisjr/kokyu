import type { PerformedSet, SessionExercise } from '../types';

/** Bump when the shape changes in a way older stored data can't safely load — see `load()`. */
export const ACTIVE_SESSION_SCHEMA_VERSION = 1;

const STORAGE_KEY = 'kokyu:training:active-session';

export interface ActiveWorkoutSessionState {
  /** Generated once at start and reused as the final `WorkoutSession.id`, so `/app/treinamento/sessao/{id}` stays a stable deep link across the whole session. */
  sessionId: string;
  routineId?: string;
  programId?: string;
  programWeekId?: string;
  scheduledEntryId?: string;
  name: string;
  /** Elapsed time is always derived from this, never accumulated in a counter that could drift. */
  startedAt: string;
  sessionExercises: SessionExercise[];
  performedSets: PerformedSet[];
  currentExerciseIndex: number;
  /** Absolute timestamp the rest period ends at; `undefined` = not resting. */
  restEndAt?: string;
  notes?: string;
}

interface StoredActiveSession {
  version: number;
  data: ActiveWorkoutSessionState;
}

/**
 * The one place that ever touches `localStorage` for the in-progress workout — mirrors
 * `features/settings/services/preferencesStorage.ts`. An in-progress session never reaches
 * `trainingMockDb`; it lives only here until `sessionService.completeWorkout` commits it in one
 * shot (see `docs/training.md`). Corrupted/unreadable data always falls back to "no active
 * session" instead of throwing.
 */
export const activeWorkoutSessionStorage = {
  load(): ActiveWorkoutSessionState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<StoredActiveSession> | null;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        parsed.version !== ACTIVE_SESSION_SCHEMA_VERSION ||
        !parsed.data
      ) {
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  },

  save(state: ActiveWorkoutSessionState): void {
    if (typeof window === 'undefined') return;
    try {
      const payload: StoredActiveSession = { version: ACTIVE_SESSION_SCHEMA_VERSION, data: state };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Quota exceeded, private-mode restrictions, etc. — the session still works for the rest of
      // this tab, it just can't survive a refresh.
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op — nothing meaningful to recover from here.
    }
  },

  hasActive(): boolean {
    return activeWorkoutSessionStorage.load() !== null;
  },
};
