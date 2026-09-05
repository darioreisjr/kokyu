import type {
  DailyRhythmHomeProjection,
  GoalHomeProjection,
  HomeAttentionItem,
  HomeProviderContext,
  HomeProviderResult,
  MissionHomeProjection,
  NutritionHomeProjection,
} from '@/shared/home/types';

export interface HomeAttentionInput {
  missions: HomeProviderResult<MissionHomeProjection>;
  goals: HomeProviderResult<GoalHomeProjection>;
  nutrition: HomeProviderResult<NutritionHomeProjection>;
  schedule: HomeProviderResult<DailyRhythmHomeProjection>;
}

/** Matches the spec's own stated priority: "schedule conflict, deadline hoje, goal atRisk, follow-up, expiring pantry, others". */
const CATEGORY_RANK: Record<string, number> = {
  scheduleConflict: 0,
  missionOverdue: 1,
  goalAtRisk: 2,
  missionWaitingFollowUp: 3,
  pantryExpiring: 4,
  goalCheckIn: 5,
  shoppingNeeded: 6,
};

interface RankedAttentionItem extends HomeAttentionItem {
  category: string;
}

/**
 * Builds `HomeSnapshot.alerts` from providers' own data — never a rule
 * invented in the UI (each card just renders what this returns). No
 * provider throwing here: a failed provider's `data` is `null` and is
 * simply skipped, matching Home's partial-failure guarantee.
 */
export function getHomeAttention(input: HomeAttentionInput, context: HomeProviderContext): HomeAttentionItem[] {
  const createdAt = context.now.toISOString();
  const items: RankedAttentionItem[] = [];

  for (const conflict of input.schedule.data?.conflicts ?? []) {
    items.push({
      id: `attention-conflict-${conflict.id}`,
      sourceType: 'dailyRhythm',
      severity: conflict.severity === 'error' ? 'important' : 'attention',
      title: 'Conflito na agenda',
      description: conflict.message,
      actionLabel: 'Ver agenda',
      actionHref: '/app/ritmo-diario',
      createdAt,
      category: 'scheduleConflict',
    });
  }

  for (const mission of input.missions.data?.overdue ?? []) {
    items.push({
      id: `attention-mission-overdue-${mission.id}`,
      sourceType: 'mission',
      severity: 'attention',
      title: `"${mission.title}" está atrasada`,
      actionLabel: 'Ver missões',
      actionHref: '/app/missoes',
      createdAt,
      category: 'missionOverdue',
    });
  }

  for (const mission of input.missions.data?.waitingFollowUp ?? []) {
    items.push({
      id: `attention-mission-followup-${mission.id}`,
      sourceType: 'mission',
      severity: 'info',
      title: `"${mission.title}" aguardando retorno`,
      actionLabel: 'Ver missões',
      actionHref: '/app/missoes',
      createdAt,
      category: 'missionWaitingFollowUp',
    });
  }

  for (const goal of input.goals.data?.atRisk ?? []) {
    items.push({
      id: `attention-goal-risk-${goal.id}`,
      sourceType: 'goal',
      severity: 'attention',
      title: `Meta "${goal.title}" precisa de atenção`,
      actionLabel: 'Ver meta',
      actionHref: '/app/metas',
      createdAt,
      category: 'goalAtRisk',
    });
  }

  const pendingCheckIns = input.goals.data?.pendingCheckIns ?? 0;
  if (pendingCheckIns > 0) {
    items.push({
      id: 'attention-goal-checkins',
      sourceType: 'goal',
      severity: 'info',
      title:
        pendingCheckIns === 1
          ? '1 check-in de meta pendente'
          : `${pendingCheckIns} check-ins de meta pendentes`,
      actionLabel: 'Ver metas',
      actionHref: '/app/metas',
      createdAt,
      category: 'goalCheckIn',
    });
  }

  const pantryUrgentCount = input.nutrition.data?.pantryUrgentCount ?? 0;
  if (pantryUrgentCount > 0) {
    items.push({
      id: 'attention-pantry-expiring',
      sourceType: 'nutrition',
      severity: 'attention',
      title:
        pantryUrgentCount === 1
          ? '1 item da despensa vence em breve'
          : `${pantryUrgentCount} itens da despensa vencem em breve`,
      actionLabel: 'Ver despensa',
      actionHref: '/app/nutricao',
      createdAt,
      category: 'pantryExpiring',
    });
  }

  const shoppingPendingCount = input.nutrition.data?.shoppingPendingCount ?? 0;
  if (shoppingPendingCount > 0) {
    items.push({
      id: 'attention-shopping-needed',
      sourceType: 'nutrition',
      severity: 'info',
      title:
        shoppingPendingCount === 1
          ? '1 item pendente na lista de compras'
          : `${shoppingPendingCount} itens pendentes na lista de compras`,
      actionLabel: 'Ver compras',
      actionHref: '/app/nutricao',
      createdAt,
      category: 'shoppingNeeded',
    });
  }

  return items
    .sort((a, b) => (CATEGORY_RANK[a.category] ?? 99) - (CATEGORY_RANK[b.category] ?? 99))
    .map(({ category: _category, ...item }) => item);
}
