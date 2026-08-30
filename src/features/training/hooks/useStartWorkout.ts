'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trainingRoutes } from '../constants/trainingRoutes';
import { useTrainingSession } from '../providers/TrainingSessionProvider';
import type { Exercise, WorkoutRoutine } from '../types';

interface PendingRoutineStart {
  routine: WorkoutRoutine;
  exercises: Exercise[];
}

export interface UseStartWorkoutResult {
  activeSessionName: string | undefined;
  pendingConflict: PendingRoutineStart | 'free' | null;
  requestStartRoutine: (routine: WorkoutRoutine, exercises: Exercise[]) => void;
  requestStartFree: () => void;
  resolveContinue: () => void;
  resolveDiscardAndStartNew: () => void;
  cancelConflict: () => void;
}

/**
 * Blocks a second active session by default (per the spec's own "impedir duas sessões ativas
 * simultaneamente"): starting a new workout while one is already running opens a
 * Continuar/Descartar choice instead of silently overwriting it. Shared by every "Iniciar treino"
 * entry point (Hoje, detalhe de rotina) instead of each duplicating this guard.
 */
export function useStartWorkout(): UseStartWorkoutResult {
  const router = useRouter();
  const { activeSession, startSession, startFreeSession, discardSession } = useTrainingSession();
  const [pendingConflict, setPendingConflict] = useState<PendingRoutineStart | 'free' | null>(null);

  function requestStartRoutine(routine: WorkoutRoutine, exercises: Exercise[]) {
    if (activeSession) {
      setPendingConflict({ routine, exercises });
      return;
    }
    const sessionId = startSession(routine, exercises);
    router.push(trainingRoutes.session(sessionId));
  }

  function requestStartFree() {
    if (activeSession) {
      setPendingConflict('free');
      return;
    }
    const sessionId = startFreeSession();
    router.push(trainingRoutes.session(sessionId));
  }

  function resolveContinue() {
    if (activeSession) router.push(trainingRoutes.session(activeSession.sessionId));
    setPendingConflict(null);
  }

  function resolveDiscardAndStartNew() {
    discardSession();
    if (pendingConflict === 'free') {
      const sessionId = startFreeSession();
      router.push(trainingRoutes.session(sessionId));
    } else if (pendingConflict) {
      const sessionId = startSession(pendingConflict.routine, pendingConflict.exercises);
      router.push(trainingRoutes.session(sessionId));
    }
    setPendingConflict(null);
  }

  function cancelConflict() {
    setPendingConflict(null);
  }

  return {
    activeSessionName: activeSession?.name,
    pendingConflict,
    requestStartRoutine,
    requestStartFree,
    resolveContinue,
    resolveDiscardAndStartNew,
    cancelConflict,
  };
}
