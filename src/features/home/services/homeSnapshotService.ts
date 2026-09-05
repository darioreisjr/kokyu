import type {
  GoalHomeProjection,
  HomeAttentionItem,
  HomePriorityItem,
  HomeProviderContext,
  HomeProviderResult,
  HomeQuickAction,
  HomeSectionProvider,
  HomeSnapshot,
  MissionHomeProjection,
} from '@/shared/home/types';
import {
  dailyRhythmHomeProvider,
  goalHomeProvider,
  habitHomeProvider,
  leisureHomeProvider,
  missionHomeProvider,
  nutritionHomeProvider,
  trainingHomeProvider,
} from '../providers';
import { computeDayProgress, getLogicalToday } from './homeDayService';
import { getHomeAttention } from './homeAttentionService';

export interface GetHomeSnapshotOptions {
  /** Defaults to the logical today (`yyyy-MM-dd`) — see `getLogicalToday`. */
  date?: string;
  now?: Date;
  dayStartsAt: string;
  dayEndsAt: string;
  weekStartsOn: 0 | 1;
}

const QUICK_ACTIONS: HomeQuickAction[] = [
  { id: 'new-mission', label: 'Nova Missão', icon: 'AssignmentRounded', href: '/app/missoes' },
  { id: 'log-habit', label: 'Registrar Hábito', icon: 'AutorenewRounded', href: '/app/habitos' },
  { id: 'plan-training', label: 'Planejar Treino', icon: 'FitnessCenterRounded', href: '/app/treinamento' },
  { id: 'add-meal', label: 'Adicionar Refeição', icon: 'RestaurantRounded', href: '/app/nutricao' },
  { id: 'save-for-later', label: 'Guardar para Depois', icon: 'MovieRounded', href: '/app/tempo-livre' },
  { id: 'new-goal', label: 'Nova Meta', icon: 'TrackChangesRounded', href: '/app/metas' },
  { id: 'new-entry', label: 'Novo Compromisso', icon: 'EventRounded', href: '/app/ritmo-diario' },
];

/**
 * Wraps one provider call so a single failing domain never breaks the
 * rest of the snapshot — see spec's "PARTIAL FAILURE"/"ERROR ISOLATION".
 */
async function runProvider<T>(
  provider: HomeSectionProvider<T>,
  context: HomeProviderContext,
): Promise<HomeProviderResult<T>> {
  try {
    const data = await provider.getHomeProjection(context);
    return { sourceType: provider.sourceType, status: 'success', data };
  } catch (error) {
    return {
      sourceType: provider.sourceType,
      status: 'error',
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados.',
    };
  }
}

function buildDailyPriorities(
  missions: HomeProviderResult<MissionHomeProjection>,
  goals: HomeProviderResult<GoalHomeProjection>,
): HomePriorityItem[] {
  const priorities: HomePriorityItem[] = [];

  const focusMission = missions.data?.focusToday;
  if (focusMission) {
    priorities.push({
      kind: 'mission',
      id: focusMission.id,
      title: focusMission.title,
      status: focusMission.status,
      actionHref: '/app/missoes',
    });
  }

  for (const goal of goals.data?.inFocus ?? []) {
    priorities.push({
      kind: 'goal',
      id: goal.id,
      title: goal.title,
      progressPercent: goal.progressPercent,
      nextStepLabel: goal.nextMilestoneTitle,
      actionHref: '/app/metas',
    });
  }

  return priorities.slice(0, 5);
}

export const homeSnapshotService = {
  async getHomeSnapshot(options: GetHomeSnapshotOptions): Promise<HomeSnapshot> {
    const date = options.date ?? getLogicalToday();
    const now = options.now ?? new Date();
    const context: HomeProviderContext = {
      date,
      now,
      dayStartsAt: options.dayStartsAt,
      dayEndsAt: options.dayEndsAt,
      weekStartsOn: options.weekStartsOn,
    };

    const [missions, habits, training, nutrition, goals, leisure, schedule] = await Promise.all([
      runProvider(missionHomeProvider, context),
      runProvider(habitHomeProvider, context),
      runProvider(trainingHomeProvider, context),
      runProvider(nutritionHomeProvider, context),
      runProvider(goalHomeProvider, context),
      runProvider(leisureHomeProvider, context),
      runProvider(dailyRhythmHomeProvider, context),
    ]);

    const dayProgress = computeDayProgress(now, options.dayStartsAt, options.dayEndsAt);
    const dailyPriorities = buildDailyPriorities(missions, goals);

    const alerts: HomeAttentionItem[] = getHomeAttention({ missions, goals, nutrition, schedule }, context);

    const nowHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentEntry = schedule.data?.currentEntry ?? null;
    const currentFreeSlot =
      !currentEntry && schedule.data
        ? (schedule.data.freeSlots.find((slot) => slot.startAt <= nowHHmm && slot.endAt > nowHHmm) ?? null)
        : null;

    const hasAnyPlannedActivity = Boolean(
      schedule.data?.hasAnyEntry ||
        (missions.data && missions.data.pendingCount + missions.data.completedCount > 0) ||
        (habits.data && habits.data.scheduledToday > 0) ||
        (training.data && (training.data.today || training.data.next)) ||
        (nutrition.data && nutrition.data.plannedMealsToday > 0) ||
        (goals.data && goals.data.inFocus.length > 0) ||
        (leisure.data && (leisure.data.plannedToday || leisure.data.inProgress)),
    );

    return {
      date,
      now: now.toISOString(),
      dayProgress,
      currentEntry,
      currentFreeSlot,
      nextEntries: schedule.data?.nextEntries ?? [],
      dailyPriorities,
      missions,
      habits,
      training,
      nutrition,
      goals,
      leisure,
      schedule,
      alerts,
      quickActions: QUICK_ACTIONS,
      hasAnyPlannedActivity,
      generatedAt: new Date().toISOString(),
    };
  },
};
