import type { FocusSession, FocusSessionInput } from '../types';
import { generateScheduleId, scheduleDb } from './scheduleMockDb';

export const FOCUS_STORAGE_KEY = 'kokyu_active_focus_session';

export function calculateElapsedSeconds(session: FocusSession, now: Date = new Date()): number {
  if (session.status === 'completed' || session.status === 'cancelled') {
    return session.actualDurationSeconds;
  }

  const startMs = new Date(session.startedAt).getTime();
  const currentMs = session.pausedAt ? new Date(session.pausedAt).getTime() : now.getTime();
  const rawDiffSeconds = Math.max(0, Math.floor((currentMs - startMs) / 1000));
  const activeSeconds = Math.max(0, rawDiffSeconds - (session.accumulatedPausedSeconds || 0));

  return activeSeconds;
}

export const focusStorage = {
  loadActiveSession(): FocusSession | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(FOCUS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as FocusSession;
          // Synchronize in-memory DB as well
          scheduleDb.activeFocusSession = parsed;
          return parsed;
        }
      } catch {
        // Fallback to in-memory db on parse error
      }
    }
    return scheduleDb.activeFocusSession;
  },

  saveActiveSession(session: FocusSession | null): void {
    scheduleDb.activeFocusSession = session;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (session) {
          window.localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(session));
        } else {
          window.localStorage.removeItem(FOCUS_STORAGE_KEY);
        }
      } catch {
        // Ignore localStorage quota or access errors in sandbox
      }
    }
  },

  startSession(input: FocusSessionInput): FocusSession {
    const nowIso = new Date().toISOString();
    const session: FocusSession = {
      id: generateScheduleId('focus'),
      scheduleEntryId: input.scheduleEntryId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      title: input.title,
      subtitle: input.subtitle,
      startedAt: nowIso,
      plannedDuration: input.plannedDuration ?? 25,
      actualDurationSeconds: 0,
      mode: input.mode ?? 'countdown',
      status: 'active',
      accumulatedPausedSeconds: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    focusStorage.saveActiveSession(session);
    return session;
  },

  pauseSession(session: FocusSession): FocusSession {
    if (session.status !== 'active') return session;

    const now = new Date();
    const elapsed = calculateElapsedSeconds(session, now);
    const updated: FocusSession = {
      ...session,
      status: 'paused',
      pausedAt: now.toISOString(),
      actualDurationSeconds: elapsed,
      updatedAt: now.toISOString(),
    };

    focusStorage.saveActiveSession(updated);
    return updated;
  },

  resumeSession(session: FocusSession): FocusSession {
    if (session.status !== 'paused' || !session.pausedAt) return session;

    const now = new Date();
    const pausedDurationSeconds = Math.max(
      0,
      Math.floor((now.getTime() - new Date(session.pausedAt).getTime()) / 1000),
    );

    const updated: FocusSession = {
      ...session,
      status: 'active',
      pausedAt: undefined,
      accumulatedPausedSeconds: session.accumulatedPausedSeconds + pausedDurationSeconds,
      updatedAt: now.toISOString(),
    };

    focusStorage.saveActiveSession(updated);
    return updated;
  },

  extendSession(session: FocusSession, extraMinutes: number): FocusSession {
    const updated: FocusSession = {
      ...session,
      plannedDuration: session.plannedDuration + extraMinutes,
      updatedAt: new Date().toISOString(),
    };

    focusStorage.saveActiveSession(updated);
    return updated;
  },

  recordInterruption(session: FocusSession, note?: string): FocusSession {
    const interruptions = session.interruptions ? [...session.interruptions] : [];
    interruptions.push({
      timestamp: new Date().toISOString(),
      note,
    });

    const updated: FocusSession = {
      ...session,
      interruptions,
      updatedAt: new Date().toISOString(),
    };

    focusStorage.saveActiveSession(updated);
    return updated;
  },

  completeSession(session: FocusSession, note?: string): FocusSession {
    const now = new Date();
    const elapsed = calculateElapsedSeconds(session, now);

    const completed: FocusSession = {
      ...session,
      status: 'completed',
      endedAt: now.toISOString(),
      actualDurationSeconds: elapsed,
      note: note ?? session.note,
      updatedAt: now.toISOString(),
    };

    focusStorage.saveActiveSession(null);
    scheduleDb.focusHistory.push(completed);
    return completed;
  },

  cancelSession(session: FocusSession): void {
    const cancelled: FocusSession = {
      ...session,
      status: 'cancelled',
      endedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    focusStorage.saveActiveSession(null);
    scheduleDb.focusHistory.push(cancelled);
  },
};

