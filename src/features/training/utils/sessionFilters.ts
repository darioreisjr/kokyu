import { isSameDay, isSameMonth, startOfWeek } from 'date-fns';

import type { WorkoutSession } from '../types';

export type SessionGroupLabel = 'Hoje' | 'Esta semana' | 'Este mês' | 'Anteriores';

export interface SessionGroup {
  label: SessionGroupLabel;
  sessions: WorkoutSession[];
}

/** Sessions are already sorted most-recent-first by `sessionService.getWorkoutHistory` — this only buckets them. */
export function groupSessionsByRecency(
  sessions: WorkoutSession[],
  now: Date = new Date(),
): SessionGroup[] {
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const buckets: Record<SessionGroupLabel, WorkoutSession[]> = {
    Hoje: [],
    'Esta semana': [],
    'Este mês': [],
    Anteriores: [],
  };

  for (const session of sessions) {
    const startedAt = new Date(session.startedAt);
    if (isSameDay(startedAt, now)) buckets.Hoje.push(session);
    else if (startedAt >= weekStart) buckets['Esta semana'].push(session);
    else if (isSameMonth(startedAt, now)) buckets['Este mês'].push(session);
    else buckets.Anteriores.push(session);
  }

  return (Object.keys(buckets) as SessionGroupLabel[])
    .map((label) => ({ label, sessions: buckets[label] }))
    .filter((group) => group.sessions.length > 0);
}
