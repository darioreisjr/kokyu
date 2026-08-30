import type {
  Goal,
  GoalActivity,
  GoalActivityType,
  GoalCheckIn,
  GoalKeyResult,
  GoalLink,
  GoalMilestone,
  GoalNote,
  GoalProgressEntry,
  GoalProgressEntrySource,
  GoalReflection,
  GoalStatus,
} from '../types';
import { calculateExpectedProgress, calculateGoalStatus } from './goalStatusEngine';
import { calculateGoalProgress } from './goalProgressEngine';
import { generateId, goalDb } from './goalMockDb';

export type GoalInput = Omit<
  Goal,
  | 'id'
  | 'status'
  | 'systemStatus'
  | 'lastCheckInStatus'
  | 'createdAt'
  | 'updatedAt'
  | 'completedAt'
  | 'archivedAt'
  | 'pausedAt'
>;

const LIFECYCLE_STATUSES: GoalStatus[] = ['paused', 'completed', 'abandoned', 'archived'];

function logActivity(
  goalId: string,
  type: GoalActivityType,
  description: string,
  metadata?: GoalActivity['metadata'],
): void {
  goalDb.activities.push({
    id: generateId('activity'),
    goalId,
    type,
    description,
    metadata,
    createdAt: new Date().toISOString(),
  });
}

function findGoalIndex(id: string): number {
  return goalDb.goals.findIndex((goal) => goal.id === id);
}

/**
 * Recomputes and (write-through) caches `systemStatus`/`status` for a goal that isn't pinned to a
 * lifecycle state — every read goes through this, so status is always fresh without every mutator
 * having to remember to recalculate it. Lifecycle states (`paused`/`completed`/`abandoned`/
 * `archived`) are never touched here; only explicit actions change them.
 */
async function hydrateGoalStatus(goal: Goal): Promise<Goal> {
  if (LIFECYCLE_STATUSES.includes(goal.status)) return goal;

  const progress = await calculateGoalProgress(goal);
  const expected = calculateExpectedProgress(goal);
  const hasStarted = Boolean(goal.lastProgressAt) || progress.percent > 0;
  const systemStatus = calculateGoalStatus(progress.percent, expected, hasStarted);

  if (systemStatus === goal.systemStatus && systemStatus === goal.status) return goal;

  const updated: Goal = { ...goal, systemStatus, status: systemStatus };
  const index = findGoalIndex(goal.id);
  if (index !== -1) goalDb.goals[index] = updated;
  return updated;
}

function recalculateAverageMeasurement(goal: Goal): Goal {
  if (goal.measurement.type !== 'average') return goal;
  const periodStart = Date.now() - goal.measurement.periodDays * 24 * 60 * 60 * 1000;
  const entries = goalDb.progressEntries.filter(
    (entry) => entry.goalId === goal.id && new Date(entry.date).getTime() >= periodStart,
  );
  const average =
    entries.length === 0
      ? goal.measurement.currentValue
      : entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length;
  return {
    ...goal,
    measurement: { ...goal.measurement, currentValue: Math.round(average * 10) / 10 },
  };
}

/** Mocked — no real backend, no HTTP. Every mutation logs a `GoalActivity`; nothing is overwritten silently. */
export const goalService = {
  async getGoals(): Promise<Goal[]> {
    return Promise.all(goalDb.goals.map((goal) => hydrateGoalStatus(goal)));
  },

  async getGoal(id: string): Promise<Goal | null> {
    const goal = goalDb.goals.find((candidate) => candidate.id === id);
    if (!goal) return null;
    return hydrateGoalStatus(goal);
  },

  async createGoal(input: GoalInput): Promise<Goal> {
    const now = new Date().toISOString();
    const goal: Goal = {
      ...input,
      id: generateId('goal'),
      status: 'notStarted',
      systemStatus: 'notStarted',
      createdAt: now,
      updatedAt: now,
    };
    goalDb.goals.push(goal);
    logActivity(goal.id, 'created', 'Meta criada.');
    return hydrateGoalStatus(goal);
  },

  async updateGoal(id: string, patch: Partial<GoalInput>): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;

    if (patch.targetDate !== undefined && patch.targetDate !== existing.targetDate) {
      logActivity(id, 'deadlineChanged', `Prazo alterado para ${patch.targetDate || 'sem prazo'}.`);
    }
    if (
      patch.measurement &&
      'targetValue' in patch.measurement &&
      existing.measurement.type !== 'binary' &&
      existing.measurement.type !== 'milestone' &&
      existing.measurement.type !== 'keyResult'
    ) {
      logActivity(id, 'targetChanged', 'Alvo da meta atualizado.');
    }

    const updated: Goal = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    goalDb.goals[index] = updated;
    return hydrateGoalStatus(updated);
  },

  async deleteGoal(id: string): Promise<void> {
    goalDb.goals = goalDb.goals.filter((goal) => goal.id !== id);
    goalDb.progressEntries = goalDb.progressEntries.filter((entry) => entry.goalId !== id);
    goalDb.checkIns = goalDb.checkIns.filter((checkIn) => checkIn.goalId !== id);
    goalDb.activities = goalDb.activities.filter((activity) => activity.goalId !== id);
    goalDb.links = goalDb.links.filter((link) => link.goalId !== id);
    goalDb.notes = goalDb.notes.filter((note) => note.goalId !== id);
    goalDb.reflections = goalDb.reflections.filter((reflection) => reflection.goalId !== id);
  },

  async archiveGoal(id: string): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const updated: Goal = {
      ...goalDb.goals[index]!,
      status: 'archived',
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goalDb.goals[index] = updated;
    logActivity(id, 'archived', 'Meta arquivada.');
    return updated;
  },

  async pauseGoal(id: string, note?: string): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const updated: Goal = {
      ...goalDb.goals[index]!,
      status: 'paused',
      pausedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goalDb.goals[index] = updated;
    logActivity(id, 'paused', 'Meta pausada.', note ? { note } : undefined);
    return updated;
  },

  /** `keepDeadline: false` clears `targetDate` instead of replanning it — the caller (a dialog) decides which of the two the user picked, never a hidden default. */
  async resumeGoal(
    id: string,
    options?: { newTargetDate?: string; keepDeadline?: boolean },
  ): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const targetDate =
      options?.keepDeadline === false ? undefined : (options?.newTargetDate ?? existing.targetDate);
    const updated: Goal = {
      ...existing,
      status: existing.systemStatus,
      targetDate,
      pausedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    goalDb.goals[index] = updated;
    logActivity(id, 'resumed', 'Meta retomada.');
    if (options?.newTargetDate && options.newTargetDate !== existing.targetDate) {
      logActivity(id, 'replanned', `Prazo replanejado para ${options.newTargetDate}.`);
    }
    return hydrateGoalStatus(updated);
  },

  async replanGoal(
    id: string,
    newTargetDate: string | undefined,
    note?: string,
  ): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const updated: Goal = {
      ...goalDb.goals[index]!,
      targetDate: newTargetDate,
      updatedAt: new Date().toISOString(),
    };
    goalDb.goals[index] = updated;
    logActivity(
      id,
      'replanned',
      `Prazo replanejado para ${newTargetDate ?? 'sem prazo'}.`,
      note ? { note } : undefined,
    );
    return hydrateGoalStatus(updated);
  },

  async completeGoal(
    id: string,
    reflection?: Omit<GoalReflection, 'id' | 'goalId' | 'context' | 'createdAt'>,
  ): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const measurement =
      existing.measurement.type === 'binary'
        ? { ...existing.measurement, completed: true }
        : existing.measurement;
    const updated: Goal = {
      ...existing,
      measurement,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goalDb.goals[index] = updated;
    logActivity(id, 'completed', 'Meta concluída.');
    if (reflection) {
      goalDb.reflections.push({
        ...reflection,
        id: generateId('reflection'),
        goalId: id,
        context: 'completion',
        createdAt: new Date().toISOString(),
      });
    }
    return updated;
  },

  async reopenGoal(id: string): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const measurement =
      existing.measurement.type === 'binary'
        ? { ...existing.measurement, completed: false }
        : existing.measurement;
    const updated: Goal = {
      ...existing,
      measurement,
      status: existing.systemStatus,
      completedAt: undefined,
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    goalDb.goals[index] = updated;
    logActivity(id, 'reopened', 'Meta reaberta.');
    return hydrateGoalStatus(updated);
  },

  async abandonGoal(
    id: string,
    reason: 'abandoned' | 'notRelevant' | 'replacedByAnother' | 'other',
    note?: string,
  ): Promise<Goal | null> {
    const index = findGoalIndex(id);
    if (index === -1) return null;
    const updated: Goal = {
      ...goalDb.goals[index]!,
      status: 'abandoned',
      updatedAt: new Date().toISOString(),
    };
    goalDb.goals[index] = updated;
    logActivity(id, 'abandoned', 'Meta encerrada.', { reason, note });
    return updated;
  },

  async duplicateGoal(id: string): Promise<Goal | null> {
    const existing = goalDb.goals.find((goal) => goal.id === id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const measurement =
      existing.measurement.type === 'numeric' || existing.measurement.type === 'consistency'
        ? { ...existing.measurement, currentValue: existing.measurement.baseline }
        : existing.measurement.type === 'average'
          ? { ...existing.measurement, currentValue: 0 }
          : existing.measurement.type === 'binary'
            ? { ...existing.measurement, completed: false }
            : existing.measurement;
    const duplicated: Goal = {
      ...existing,
      id: generateId('goal'),
      measurement,
      milestones: existing.milestones?.map((milestone) => ({
        ...milestone,
        id: generateId('milestone'),
        completed: false,
        completedAt: undefined,
      })),
      keyResults: existing.keyResults?.map((keyResult) => ({
        ...keyResult,
        id: generateId('kr'),
        current: keyResult.baseline,
        status: 'notStarted',
      })),
      status: 'notStarted',
      systemStatus: 'notStarted',
      lastCheckInStatus: undefined,
      lastProgressAt: undefined,
      lastCheckInAt: undefined,
      completedAt: undefined,
      archivedAt: undefined,
      pausedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };
    goalDb.goals.push(duplicated);
    logActivity(duplicated.id, 'created', `Meta duplicada a partir de "${existing.title}".`);
    return duplicated;
  },

  async addProgress(
    goalId: string,
    value: number,
    date: string,
    note?: string,
    source: GoalProgressEntrySource = 'manual',
    entityId?: string,
  ): Promise<GoalProgressEntry> {
    const entry: GoalProgressEntry = {
      id: generateId('progress'),
      goalId,
      value,
      date,
      note,
      source,
      entityId,
      createdAt: new Date().toISOString(),
    };
    goalDb.progressEntries.push(entry);

    const index = findGoalIndex(goalId);
    if (index !== -1) {
      const existing = goalDb.goals[index]!;
      let measurement = existing.measurement;
      if (measurement.type === 'numeric' || measurement.type === 'consistency') {
        measurement = { ...measurement, currentValue: value };
      }
      let updated: Goal = {
        ...existing,
        measurement,
        lastProgressAt: entry.createdAt,
        updatedAt: entry.createdAt,
      };
      updated = recalculateAverageMeasurement(updated);
      goalDb.goals[index] = updated;
      logActivity(
        goalId,
        'progressUpdated',
        `Progresso atualizado para ${value}.`,
        note ? { note } : undefined,
      );
    }

    return entry;
  },

  async getGoalProgress(goalId: string): Promise<GoalProgressEntry[]> {
    return goalDb.progressEntries
      .filter((entry) => entry.goalId === goalId)
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async createCheckIn(
    goalId: string,
    input: Omit<GoalCheckIn, 'id' | 'goalId' | 'createdAt'>,
  ): Promise<GoalCheckIn> {
    const checkIn: GoalCheckIn = {
      ...input,
      id: generateId('checkin'),
      goalId,
      createdAt: new Date().toISOString(),
    };
    goalDb.checkIns.push(checkIn);

    const index = findGoalIndex(goalId);
    if (index !== -1) {
      const existing = goalDb.goals[index]!;
      goalDb.goals[index] = {
        ...existing,
        lastCheckInStatus: checkIn.perceivedStatus,
        lastCheckInAt: checkIn.createdAt,
        updatedAt: checkIn.createdAt,
      };
    }
    logActivity(goalId, 'checkIn', 'Check-in registrado.');
    return checkIn;
  },

  async getCheckIns(goalId: string): Promise<GoalCheckIn[]> {
    return goalDb.checkIns
      .filter((checkIn) => checkIn.goalId === goalId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Goals whose `checkInFrequency` interval has elapsed since the last check-in — most overdue first. Never includes a paused/completed/abandoned/archived goal. */
  async getPendingCheckIns(now: Date = new Date()): Promise<{ goal: Goal; daysOverdue: number }[]> {
    const frequencyDays: Record<Exclude<Goal['checkInFrequency'], 'none'>, number> = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      custom: 30,
    };
    const goals = await goalService.getGoals();

    return goals
      .filter(
        (goal) => goal.checkInFrequency !== 'none' && !LIFECYCLE_STATUSES.includes(goal.status),
      )
      .map((goal) => {
        const intervalDays =
          frequencyDays[goal.checkInFrequency as Exclude<Goal['checkInFrequency'], 'none'>];
        const lastReference = goal.lastCheckInAt ?? goal.createdAt;
        const daysSince = Math.floor(
          (now.getTime() - new Date(lastReference).getTime()) / (24 * 60 * 60 * 1000),
        );
        return { goal, daysOverdue: daysSince - intervalDays };
      })
      .filter(({ daysOverdue }) => daysOverdue >= 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  },

  async addMilestone(
    goalId: string,
    input: Omit<GoalMilestone, 'id' | 'completed' | 'completedAt' | 'order'>,
  ): Promise<GoalMilestone | null> {
    const index = findGoalIndex(goalId);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const milestone: GoalMilestone = {
      ...input,
      id: generateId('milestone'),
      completed: false,
      order: existing.milestones?.length ?? 0,
    };
    goalDb.goals[index] = {
      ...existing,
      milestones: [...(existing.milestones ?? []), milestone],
      updatedAt: new Date().toISOString(),
    };
    return milestone;
  },

  async completeMilestone(
    goalId: string,
    milestoneId: string,
    completed = true,
  ): Promise<Goal | null> {
    const index = findGoalIndex(goalId);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const milestones = (existing.milestones ?? []).map((milestone) =>
      milestone.id === milestoneId
        ? { ...milestone, completed, completedAt: completed ? new Date().toISOString() : undefined }
        : milestone,
    );
    const updated: Goal = { ...existing, milestones, updatedAt: new Date().toISOString() };
    goalDb.goals[index] = updated;
    if (completed) {
      const title = milestones.find((milestone) => milestone.id === milestoneId)?.title ?? '';
      logActivity(goalId, 'milestoneCompleted', `Marco concluído: ${title}.`);
    }
    return hydrateGoalStatus(updated);
  },

  async reorderMilestones(goalId: string, orderedMilestoneIds: string[]): Promise<Goal | null> {
    const index = findGoalIndex(goalId);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const milestones = (existing.milestones ?? [])
      .map((milestone) => ({ ...milestone, order: orderedMilestoneIds.indexOf(milestone.id) }))
      .sort((a, b) => a.order - b.order);
    const updated: Goal = { ...existing, milestones, updatedAt: new Date().toISOString() };
    goalDb.goals[index] = updated;
    return updated;
  },

  async addKeyResult(
    goalId: string,
    input: Omit<GoalKeyResult, 'id' | 'status'>,
  ): Promise<GoalKeyResult | null> {
    const index = findGoalIndex(goalId);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const keyResult: GoalKeyResult = {
      ...input,
      id: generateId('kr'),
      status:
        input.current >= input.target
          ? 'completed'
          : input.current > input.baseline
            ? 'inProgress'
            : 'notStarted',
    };
    goalDb.goals[index] = {
      ...existing,
      keyResults: [...(existing.keyResults ?? []), keyResult],
      updatedAt: new Date().toISOString(),
    };
    return keyResult;
  },

  async updateKeyResult(
    goalId: string,
    keyResultId: string,
    patch: Partial<Pick<GoalKeyResult, 'current' | 'status'>>,
  ): Promise<Goal | null> {
    const index = findGoalIndex(goalId);
    if (index === -1) return null;
    const existing = goalDb.goals[index]!;
    const keyResults = (existing.keyResults ?? []).map((keyResult) => {
      if (keyResult.id !== keyResultId) return keyResult;
      const current = patch.current ?? keyResult.current;
      const status =
        patch.status ??
        (current >= keyResult.target
          ? 'completed'
          : current > keyResult.baseline
            ? 'inProgress'
            : 'notStarted');
      return { ...keyResult, current, status };
    });
    const updated: Goal = { ...existing, keyResults, updatedAt: new Date().toISOString() };
    goalDb.goals[index] = updated;
    return hydrateGoalStatus(updated);
  },

  async linkGoalEntity(
    goalId: string,
    input: Omit<GoalLink, 'id' | 'goalId' | 'createdAt'>,
  ): Promise<GoalLink> {
    const duplicate = goalDb.links.find(
      (link) =>
        link.goalId === goalId &&
        link.entityType === input.entityType &&
        link.entityId === input.entityId,
    );
    if (duplicate) return duplicate;
    const link: GoalLink = {
      ...input,
      id: generateId('link'),
      goalId,
      createdAt: new Date().toISOString(),
    };
    goalDb.links.push(link);
    logActivity(goalId, 'linkedEntityAdded', `${input.entityLabel} vinculado(a) à meta.`);
    return link;
  },

  async unlinkGoalEntity(goalId: string, linkId: string): Promise<void> {
    const link = goalDb.links.find((candidate) => candidate.id === linkId);
    goalDb.links = goalDb.links.filter((candidate) => candidate.id !== linkId);
    if (link)
      logActivity(goalId, 'linkedEntityRemoved', `${link.entityLabel} desvinculado(a) da meta.`);
  },

  async getGoalLinks(goalId: string): Promise<GoalLink[]> {
    return goalDb.links.filter((link) => link.goalId === goalId);
  },

  async getGoalActivities(goalId: string): Promise<GoalActivity[]> {
    return goalDb.activities
      .filter((activity) => activity.goalId === goalId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Every activity across every goal — backs `/app/metas/historico`'s timeline. */
  async getAllActivities(): Promise<GoalActivity[]> {
    return [...goalDb.activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getGoalNotes(goalId: string): Promise<GoalNote[]> {
    return goalDb.notes
      .filter((note) => note.goalId === goalId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async addGoalNote(goalId: string, text: string, tags?: string[]): Promise<GoalNote> {
    const note: GoalNote = {
      id: generateId('note'),
      goalId,
      text,
      tags,
      createdAt: new Date().toISOString(),
    };
    goalDb.notes.push(note);
    return note;
  },

  async getGoalReflections(goalId: string): Promise<GoalReflection[]> {
    return goalDb.reflections.filter((reflection) => reflection.goalId === goalId);
  },
};
