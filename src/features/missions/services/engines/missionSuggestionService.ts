import { differenceInCalendarDays } from 'date-fns';

import type { Mission, MissionDependency, MissionSuggestion } from '../../types';
import { isMissionAvailable, isMissionTerminal } from '../../utils/missionDateStatus';
import { fromDateKey } from '../../utils/missionDateKey';
import { isMissionBlocked, type MissionStatusById } from './missionDependencyEngine';

export interface MissionSuggestionContext {
  /** "yyyy-MM-dd" */
  today: string;
  /** Goal ids currently "in focus" (daily priorities) — missions contributing to them score higher. */
  focusGoalIds: string[];
  /** Minutes still free today, from the Ritmo Diário capacity engine — missions that fit score slightly higher. */
  availableCapacityMinutes?: number;
  maxSuggestions?: number;
}

const PRIORITY_SCORE: Record<Mission['priority'], number> = {
  none: 0,
  low: 5,
  medium: 10,
  high: 25,
  critical: 40,
};

function daysUntil(dateKey: string, today: string): number {
  return differenceInCalendarDays(fromDateKey(dateKey), fromDateKey(today));
}

function scoreMission(mission: Mission, context: MissionSuggestionContext): { score: number; reason: string } {
  let score = PRIORITY_SCORE[mission.priority];
  const reasons: string[] = [];

  if (mission.priority === 'critical') reasons.push('Prioridade urgente');
  else if (mission.priority === 'high') reasons.push('Prioridade alta');

  if (mission.importance === 'high') {
    score += 15;
    reasons.push('Importante');
  }

  if (mission.deadline) {
    const daysToDeadline = daysUntil(mission.deadline, context.today);
    if (daysToDeadline <= 0) {
      score += 45;
      reasons.push('Prazo vencido');
    } else if (daysToDeadline <= 3) {
      score += 30 - daysToDeadline * 5;
      reasons.push(`Prazo em ${daysToDeadline} dia${daysToDeadline > 1 ? 's' : ''}`);
    }
  }

  if (mission.plannedDate && mission.plannedDate < context.today) {
    score += 20;
    reasons.push('Planejada para um dia anterior e ainda não concluída');
  }

  if (context.focusGoalIds.length > 0 && mission.goalIds.some((id) => context.focusGoalIds.includes(id))) {
    score += 20;
    reasons.push('Contribui para uma meta em foco');
  }

  if (
    mission.estimatedDuration &&
    context.availableCapacityMinutes !== undefined &&
    mission.estimatedDuration <= context.availableCapacityMinutes
  ) {
    score += 5;
    reasons.push('Cabe no tempo disponível hoje');
  }

  return { score, reason: reasons[0] ?? 'Candidata disponível para hoje' };
}

/**
 * Deterministic candidate list for "Sugestões" — never mutates or auto-adds anything to Today
 * (spec "NÃO ADICIONAR AUTOMATICAMENTE"). The caller decides whether/where to place a suggestion.
 */
export function getMissionSuggestions(
  missions: Mission[],
  dependencies: MissionDependency[],
  context: MissionSuggestionContext,
): MissionSuggestion[] {
  const statusById: MissionStatusById = Object.fromEntries(missions.map((m) => [m.id, m.status]));

  return missions
    .filter((mission) => !isMissionTerminal(mission))
    .filter((mission) => mission.status !== 'waiting')
    .filter((mission) => mission.plannedDate !== context.today)
    .filter((mission) => isMissionAvailable(mission, context.today))
    .filter((mission) => !isMissionBlocked(mission.id, dependencies, statusById))
    .map((mission) => ({ mission, ...scoreMission(mission, context) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, context.maxSuggestions ?? 10)
    .map(({ mission, score, reason }) => ({ missionId: mission.id, score, reason }));
}
