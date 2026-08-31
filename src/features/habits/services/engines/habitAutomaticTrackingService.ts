import type { HabitSourceEvent } from '../../types/adapters.types';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import { generateId } from '../habitMockDb';

export function findHabitsForSourceEvent(
  habits: Habit[],
  sourceModule: string,
  metricId: string,
): Habit[] {
  return habits.filter(
    (h) =>
      h.status === 'active' &&
      h.source === sourceModule &&
      h.sourceRef?.metricId === metricId &&
      h.sourceRef.autoLog,
  );
}

export function processSourceEvent(
  event: HabitSourceEvent,
  habit: Habit,
  existingLogs: HabitLog[],
): { log: HabitLog; isDuplicate: boolean } {
  // Idempotency check: verify if a log with this exact sourceEventId already exists
  const existing = existingLogs.find(
    (l) => l.habitId === habit.id && l.sourceEventId === event.sourceEventId,
  );

  if (existing) {
    return { log: existing, isDuplicate: true };
  }

  const now = new Date().toISOString();
  const log: HabitLog = {
    id: generateId('log-auto'),
    habitId: habit.id,
    date: event.date,
    timestamp: event.timestamp ?? now,
    status: 'completed',
    value: event.value,
    note: event.description,
    source: event.module,
    sourceEventId: event.sourceEventId,
    createdAt: now,
    updatedAt: now,
  };

  return { log, isDuplicate: false };
}
