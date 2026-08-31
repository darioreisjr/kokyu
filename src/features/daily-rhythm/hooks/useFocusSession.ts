'use client';

import { useCallback, useEffect, useState } from 'react';
import { calculateElapsedSeconds, focusStorage } from '@/shared/scheduling/services/focusStorage';
import type { FocusSession, FocusSessionInput } from '@/shared/scheduling/types';

export function useFocusSession() {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Load active session from storage on mount
  useEffect(() => {
    const loaded = focusStorage.loadActiveSession();
    setActiveSession(loaded);
    if (loaded) {
      setElapsedSeconds(calculateElapsedSeconds(loaded));
    }
  }, []);

  // Update timer display every second
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsedSeconds(activeSession));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = useCallback((input: FocusSessionInput) => {
    const created = focusStorage.startSession(input);
    setActiveSession(created);
    setElapsedSeconds(0);
    return created;
  }, []);

  const pauseSession = useCallback(() => {
    if (!activeSession) return;
    const paused = focusStorage.pauseSession(activeSession);
    setActiveSession(paused);
    setElapsedSeconds(paused.actualDurationSeconds);
  }, [activeSession]);

  const resumeSession = useCallback(() => {
    if (!activeSession) return;
    const resumed = focusStorage.resumeSession(activeSession);
    setActiveSession(resumed);
    setElapsedSeconds(calculateElapsedSeconds(resumed));
  }, [activeSession]);

  const extendSession = useCallback((extraMinutes: number) => {
    if (!activeSession) return;
    const extended = focusStorage.extendSession(activeSession, extraMinutes);
    setActiveSession(extended);
  }, [activeSession]);

  const recordInterruption = useCallback((note?: string) => {
    if (!activeSession) return;
    const updated = focusStorage.recordInterruption(activeSession, note);
    setActiveSession(updated);
  }, [activeSession]);

  const completeSession = useCallback((note?: string) => {
    if (!activeSession) return null;
    const completed = focusStorage.completeSession(activeSession, note);
    setActiveSession(null);
    setElapsedSeconds(0);
    return completed;
  }, [activeSession]);

  const cancelSession = useCallback(() => {
    if (!activeSession) return;
    focusStorage.cancelSession(activeSession);
    setActiveSession(null);
    setElapsedSeconds(0);
  }, [activeSession]);

  const totalPlannedSeconds = (activeSession?.plannedDuration ?? 25) * 60;
  const remainingSeconds = Math.max(0, totalPlannedSeconds - elapsedSeconds);
  const progressPercent =
    totalPlannedSeconds > 0
      ? Math.min(100, Math.round((elapsedSeconds / totalPlannedSeconds) * 100))
      : 0;

  return {
    activeSession,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    startSession,
    pauseSession,
    resumeSession,
    extendSession,
    recordInterruption,
    completeSession,
    cancelSession,
  };
}

