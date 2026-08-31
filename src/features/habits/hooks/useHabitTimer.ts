'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

export interface UseHabitTimerResult {
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  elapsedSeconds: number;
  totalSeconds: number;
  progressPercent: number;
  start: (minutes: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => number; // returns elapsed minutes
  reset: () => void;
}

let timerTargetEndMs: number | null = null;
let timerPausedRemainingMs: number | null = null;
let timerTotalSeconds = 0;
let timerStartedAtMs: number | null = null;
let timerAccumulatedElapsedMs = 0;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

if (typeof window !== 'undefined') {
  setInterval(() => {
    if (timerTargetEndMs !== null) {
      notify();
    }
  }, 250);
}

function getRemainingSnapshot(): number {
  if (timerPausedRemainingMs !== null) {
    return Math.max(0, Math.ceil(timerPausedRemainingMs / 1000));
  }
  if (timerTargetEndMs === null) {
    return 0;
  }
  const remainingMs = timerTargetEndMs - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

function getElapsedSnapshot(): number {
  if (timerStartedAtMs === null) {
    return Math.round(timerAccumulatedElapsedMs / 1000);
  }
  const currentSessionMs = timerTargetEndMs !== null ? Date.now() - timerStartedAtMs : 0;
  return Math.round((timerAccumulatedElapsedMs + currentSessionMs) / 1000);
}

function getIsRunningSnapshot(): boolean {
  return timerTargetEndMs !== null;
}

function getIsPausedSnapshot(): boolean {
  return timerPausedRemainingMs !== null;
}

export function useHabitTimer(): UseHabitTimerResult {
  const remainingSeconds = useSyncExternalStore(subscribe, getRemainingSnapshot, () => 0);
  const elapsedSeconds = useSyncExternalStore(subscribe, getElapsedSnapshot, () => 0);
  const isRunning = useSyncExternalStore(subscribe, getIsRunningSnapshot, () => false);
  const isPaused = useSyncExternalStore(subscribe, getIsPausedSnapshot, () => false);

  const [totalSecs, setTotalSecs] = useState(timerTotalSeconds);

  const start = useCallback((minutes: number) => {
    const ms = minutes * 60 * 1000;
    timerTotalSeconds = minutes * 60;
    timerTargetEndMs = Date.now() + ms;
    timerPausedRemainingMs = null;
    timerStartedAtMs = Date.now();
    timerAccumulatedElapsedMs = 0;
    setTotalSecs(minutes * 60);
    notify();
  }, []);

  const pause = useCallback(() => {
    if (timerTargetEndMs !== null && timerStartedAtMs !== null) {
      const remainingMs = Math.max(0, timerTargetEndMs - Date.now());
      timerAccumulatedElapsedMs += Date.now() - timerStartedAtMs;
      timerPausedRemainingMs = remainingMs;
      timerTargetEndMs = null;
      timerStartedAtMs = null;
      notify();
    }
  }, []);

  const resume = useCallback(() => {
    if (timerPausedRemainingMs !== null) {
      timerTargetEndMs = Date.now() + timerPausedRemainingMs;
      timerStartedAtMs = Date.now();
      timerPausedRemainingMs = null;
      notify();
    }
  }, []);

  const stop = useCallback(() => {
    let finalElapsedMs = timerAccumulatedElapsedMs;
    if (timerStartedAtMs !== null) {
      finalElapsedMs += Date.now() - timerStartedAtMs;
    }
    const elapsedMinutes = Math.max(1, Math.round(finalElapsedMs / (60 * 1000)));

    timerTargetEndMs = null;
    timerPausedRemainingMs = null;
    timerStartedAtMs = null;
    timerAccumulatedElapsedMs = 0;
    timerTotalSeconds = 0;
    setTotalSecs(0);
    notify();

    return elapsedMinutes;
  }, []);

  const reset = useCallback(() => {
    timerTargetEndMs = null;
    timerPausedRemainingMs = null;
    timerStartedAtMs = null;
    timerAccumulatedElapsedMs = 0;
    timerTotalSeconds = 0;
    setTotalSecs(0);
    notify();
  }, []);

  const progressPercent =
    totalSecs > 0 ? Math.min(100, Math.round((elapsedSeconds / totalSecs) * 100)) : 0;

  return {
    isRunning,
    isPaused,
    remainingSeconds,
    elapsedSeconds,
    totalSeconds: totalSecs,
    progressPercent,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
