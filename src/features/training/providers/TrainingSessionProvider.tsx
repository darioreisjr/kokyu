'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  activeWorkoutSessionStorage,
  type ActiveWorkoutSessionState,
} from '../services/activeWorkoutSessionStorage';
import { sessionService } from '../services/sessionService';
import type {
  CompleteWorkoutInput,
  Exercise,
  PerformedSet,
  PersonalRecordCheckResult,
  SessionExercise,
  WorkoutRoutine,
  WorkoutSession,
} from '../types';
import { createTempId } from '../utils/createTempId';

export interface StartSessionOptions {
  programId?: string;
  programWeekId?: string;
  scheduledEntryId?: string;
}

export interface LogSetInput {
  setNumber: number;
  /** Required, not defaulted — a warmup set logged without its real type would otherwise silently count as `working` toward volume/PRs. */
  setType: PerformedSet['setType'];
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number;
  rir?: number;
  notes?: string;
  completed: boolean;
}

export interface TrainingSessionContextValue {
  activeSession: ActiveWorkoutSessionState | null;
  isHydrated: boolean;
  /** Returns the new session's id synchronously so the caller can navigate right away, even though the state update itself is deferred. */
  startSession: (
    routine: WorkoutRoutine,
    exercises: Exercise[],
    options?: StartSessionOptions,
  ) => string;
  startFreeSession: () => string;
  logSet: (sessionExerciseId: string, input: LogSetInput) => void;
  addSetToExercise: (sessionExerciseId: string) => void;
  addExerciseToSession: (exercise: Exercise) => void;
  removeExerciseFromSession: (sessionExerciseId: string) => void;
  substituteExercise: (sessionExerciseId: string, exercise: Exercise) => void;
  startRest: (durationSeconds: number) => void;
  skipRest: () => void;
  goToExercise: (index: number) => void;
  updateNotes: (notes: string) => void;
  finishWorkout: (
    perceivedEffort?: number,
  ) => Promise<{ session: WorkoutSession; newRecords: PersonalRecordCheckResult[] } | null>;
  discardSession: () => void;
}

const TrainingSessionContext = createContext<TrainingSessionContextValue | null>(null);

function buildSessionExercises(
  sessionId: string,
  routine: WorkoutRoutine,
  exercises: Exercise[],
): SessionExercise[] {
  return routine.exercises.map((routineExercise, index) => ({
    id: createTempId('se'),
    sessionId,
    exerciseId: routineExercise.exerciseId,
    exerciseName:
      exercises.find((exercise) => exercise.id === routineExercise.exerciseId)?.name ??
      routineExercise.exerciseId,
    order: index + 1,
    groupId: routineExercise.groupId,
    sets: routineExercise.sets.map((set) => ({
      setNumber: set.order,
      setType: set.setType,
      targetReps: set.targetReps,
      targetRepsMax: set.targetRepsMax,
      targetLoadKg: set.targetLoadKg,
      loadType: set.loadType,
      targetDurationSeconds: set.targetDurationSeconds,
      targetDistanceMeters: set.targetDistanceMeters,
      restSeconds: set.restSeconds,
    })),
  }));
}

/**
 * An in-progress workout never touches `trainingMockDb` — it lives only here (+
 * `activeWorkoutSessionStorage`) until `finishWorkout` commits it in one shot via
 * `sessionService.completeWorkout`. Scoped to `/app/treinamento` (mounted in its `layout.tsx`),
 * not app-wide — no other route needs a floating workout widget (see `docs/training.md`).
 */
export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSessionState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setActiveSession(activeWorkoutSessionStorage.load());
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (activeSession) activeWorkoutSessionStorage.save(activeSession);
    else activeWorkoutSessionStorage.clear();
  }, [activeSession, isHydrated]);

  const startSession = useCallback(
    (routine: WorkoutRoutine, exercises: Exercise[], options?: StartSessionOptions) => {
      const sessionId = createTempId('session');
      setActiveSession({
        sessionId,
        routineId: routine.id,
        programId: options?.programId,
        programWeekId: options?.programWeekId,
        scheduledEntryId: options?.scheduledEntryId,
        name: routine.name,
        startedAt: new Date().toISOString(),
        sessionExercises: buildSessionExercises(sessionId, routine, exercises),
        performedSets: [],
        currentExerciseIndex: 0,
      });
      return sessionId;
    },
    [],
  );

  const startFreeSession = useCallback(() => {
    const sessionId = createTempId('session');
    setActiveSession({
      sessionId,
      name: 'Treino livre',
      startedAt: new Date().toISOString(),
      sessionExercises: [],
      performedSets: [],
      currentExerciseIndex: 0,
    });
    return sessionId;
  }, []);

  const logSet = useCallback((sessionExerciseId: string, input: LogSetInput) => {
    setActiveSession((current) => {
      if (!current) return current;
      const existingIndex = current.performedSets.findIndex(
        (set) => set.sessionExerciseId === sessionExerciseId && set.setNumber === input.setNumber,
      );
      const base: PerformedSet =
        existingIndex !== -1
          ? current.performedSets[existingIndex]!
          : {
              id: createTempId('ps'),
              sessionId: current.sessionId,
              sessionExerciseId,
              setNumber: input.setNumber,
              setType: input.setType,
              completed: false,
            };
      const updated: PerformedSet = {
        ...base,
        ...input,
        completedAt: input.completed ? new Date().toISOString() : base.completedAt,
      };
      const performedSets =
        existingIndex !== -1
          ? current.performedSets.map((set, index) => (index === existingIndex ? updated : set))
          : [...current.performedSets, updated];
      return { ...current, performedSets };
    });
  }, []);

  const addExerciseToSession = useCallback((exercise: Exercise) => {
    setActiveSession((current) => {
      if (!current) return current;
      const sessionExercise: SessionExercise = {
        id: createTempId('se'),
        sessionId: current.sessionId,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        order: current.sessionExercises.length + 1,
        sets: [{ setNumber: 1, setType: 'working', restSeconds: 90 }],
      };
      return { ...current, sessionExercises: [...current.sessionExercises, sessionExercise] };
    });
  }, []);

  const addSetToExercise = useCallback((sessionExerciseId: string) => {
    setActiveSession((current) => {
      if (!current) return current;
      return {
        ...current,
        sessionExercises: current.sessionExercises.map((sessionExercise) => {
          if (sessionExercise.id !== sessionExerciseId) return sessionExercise;
          const lastSet = sessionExercise.sets[sessionExercise.sets.length - 1];
          return {
            ...sessionExercise,
            sets: [
              ...sessionExercise.sets,
              {
                setNumber: sessionExercise.sets.length + 1,
                setType: 'working',
                targetReps: lastSet?.targetReps,
                targetLoadKg: lastSet?.targetLoadKg,
                restSeconds: lastSet?.restSeconds ?? 90,
              },
            ],
          };
        }),
      };
    });
  }, []);

  const removeExerciseFromSession = useCallback((sessionExerciseId: string) => {
    setActiveSession((current) => {
      if (!current) return current;
      return {
        ...current,
        sessionExercises: current.sessionExercises.filter(
          (exercise) => exercise.id !== sessionExerciseId,
        ),
        performedSets: current.performedSets.filter(
          (set) => set.sessionExerciseId !== sessionExerciseId,
        ),
      };
    });
  }, []);

  const substituteExercise = useCallback((sessionExerciseId: string, exercise: Exercise) => {
    setActiveSession((current) => {
      if (!current) return current;
      return {
        ...current,
        sessionExercises: current.sessionExercises.map((sessionExercise) =>
          sessionExercise.id === sessionExerciseId
            ? {
                ...sessionExercise,
                substitutedForExerciseId: sessionExercise.exerciseId,
                exerciseId: exercise.id,
                exerciseName: exercise.name,
              }
            : sessionExercise,
        ),
      };
    });
  }, []);

  const startRest = useCallback((durationSeconds: number) => {
    setActiveSession((current) =>
      current
        ? { ...current, restEndAt: new Date(Date.now() + durationSeconds * 1000).toISOString() }
        : current,
    );
  }, []);

  const skipRest = useCallback(() => {
    setActiveSession((current) => (current ? { ...current, restEndAt: undefined } : current));
  }, []);

  const goToExercise = useCallback((index: number) => {
    setActiveSession((current) =>
      current ? { ...current, currentExerciseIndex: index } : current,
    );
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setActiveSession((current) => (current ? { ...current, notes } : current));
  }, []);

  const finishWorkout = useCallback(
    async (perceivedEffort?: number) => {
      if (!activeSession) return null;
      const input: CompleteWorkoutInput = {
        sessionId: activeSession.sessionId,
        routineId: activeSession.routineId,
        programId: activeSession.programId,
        programWeekId: activeSession.programWeekId,
        scheduledEntryId: activeSession.scheduledEntryId,
        name: activeSession.name,
        startedAt: activeSession.startedAt,
        finishedAt: new Date().toISOString(),
        sessionExercises: activeSession.sessionExercises,
        performedSets: activeSession.performedSets,
        notes: activeSession.notes,
        perceivedEffort,
      };
      const result = await sessionService.completeWorkout(input);
      setActiveSession(null);
      return result;
    },
    [activeSession],
  );

  const discardSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const value = useMemo<TrainingSessionContextValue>(
    () => ({
      activeSession,
      isHydrated,
      startSession,
      startFreeSession,
      logSet,
      addSetToExercise,
      addExerciseToSession,
      removeExerciseFromSession,
      substituteExercise,
      startRest,
      skipRest,
      goToExercise,
      updateNotes,
      finishWorkout,
      discardSession,
    }),
    [
      activeSession,
      isHydrated,
      startSession,
      startFreeSession,
      logSet,
      addSetToExercise,
      addExerciseToSession,
      removeExerciseFromSession,
      substituteExercise,
      startRest,
      skipRest,
      goToExercise,
      updateNotes,
      finishWorkout,
      discardSession,
    ],
  );

  return (
    <TrainingSessionContext.Provider value={value}>{children}</TrainingSessionContext.Provider>
  );
}

export function useTrainingSession(): TrainingSessionContextValue {
  const context = useContext(TrainingSessionContext);
  if (!context) throw new Error('useTrainingSession must be used within a TrainingSessionProvider');
  return context;
}
