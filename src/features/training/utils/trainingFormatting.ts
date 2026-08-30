import type { SetPrescription } from '../types';

export function formatDurationMinutes(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

/** e.g. "6-8 reps" or "8 reps" when there's no range. */
export function formatRepRange(
  set: Pick<SetPrescription, 'targetReps' | 'targetRepsMax'>,
): string | null {
  if (set.targetReps === undefined) return null;
  if (set.targetRepsMax !== undefined && set.targetRepsMax !== set.targetReps) {
    return `${set.targetReps}-${set.targetRepsMax} reps`;
  }
  return `${set.targetReps} reps`;
}

export function formatRestSeconds(restSeconds: number): string {
  if (restSeconds < 60) return `${restSeconds}s`;
  const minutes = Math.floor(restSeconds / 60);
  const seconds = restSeconds % 60;
  return seconds === 0 ? `${minutes}min` : `${minutes}min${seconds}s`;
}

export function formatSecondsClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
