import { DEFAULT_PRIORITY_WEIGHTS } from '../constants/schedulingConstants';
import type { FreeTimeSlot, ScheduleEntry } from '../types';
import {
  isTimeAfter,
  isTimeBefore,
  timeToMinutes,
} from '../utils/timeHelpers';

export interface EvaluatedSlot {
  slot: FreeTimeSlot;
  score: number;
  reason: string;
}

export interface ItemSlotEvaluation {
  fits: boolean;
  score: number;
  reason: string;
  canChunk?: boolean;
  chunkDuration?: number;
}

export interface EvaluationOptions {
  bufferMinutes?: number;
}

/**
 * Evaluates how well an individual item fits into a specific slot.
 */
export function evaluateItemForSlot(
  item: ScheduleEntry,
  slot: FreeTimeSlot,
  options: EvaluationOptions = {},
): ItemSlotEvaluation {
  const bufferMinutes = options.bufferMinutes ?? 0;
  const effectiveSlotDuration = slot.duration - bufferMinutes;

  // Check required timeWindow
  if (item.timeWindow) {
    if (isTimeBefore(slot.startAt, item.timeWindow.start) || isTimeAfter(slot.endAt, item.timeWindow.end)) {
      return {
        fits: false,
        score: -1,
        reason: 'Fora da janela de horário exigida',
        canChunk: false,
      };
    }
  }

  // Fits completely
  if (item.duration <= effectiveSlotDuration) {
    const pWeight = DEFAULT_PRIORITY_WEIGHTS[item.priority ?? 'medium'];
    let score = 100 + pWeight;
    const reasons: string[] = [];

    if (item.priority === 'high' || item.priority === 'focus') {
      reasons.push('Item de alta prioridade');
    }

    if (slot.duration === item.duration) {
      score += 30;
      reasons.push('Encaixe perfeito');
    }

    return {
      fits: true,
      score,
      reason: reasons.length > 0 ? reasons.join(' • ') : 'Encaixa no horário',
      canChunk: false,
    };
  }

  // Does not fit completely — check chunking
  if (item.splittable) {
    const minChunk = item.minChunkDuration ?? 30;
    if (effectiveSlotDuration >= minChunk) {
      return {
        fits: false,
        score: 50,
        reason: `Pode ser dividido em bloco de ${effectiveSlotDuration}min`,
        canChunk: true,
        chunkDuration: effectiveSlotDuration,
      };
    }
  }

  return {
    fits: false,
    score: 0,
    reason: 'Duração excede o espaço disponível',
    canChunk: false,
  };
}

/**
 * Deterministically ranks unscheduled candidates by priority weight and duration.
 */
export function rankCandidatesForScheduling(candidates: ScheduleEntry[]): ScheduleEntry[] {
  return [...candidates].sort((a, b) => {
    const pA = DEFAULT_PRIORITY_WEIGHTS[a.priority ?? 'medium'];
    const pB = DEFAULT_PRIORITY_WEIGHTS[b.priority ?? 'medium'];
    if (pB !== pA) return pB - pA; // High priority first

    // Larger items first to avoid fragmenting big gaps
    return b.duration - a.duration;
  });
}

/**
 * Finds the optimal slot for a candidate based on preferred time, energy match and fit.
 */
export function evaluateBestSlotForCandidate(
  candidate: ScheduleEntry,
  freeSlots: FreeTimeSlot[],
): EvaluatedSlot | null {
  const eligibleSlots = freeSlots.filter((slot) => slot.duration >= candidate.duration);
  if (eligibleSlots.length === 0) return null;

  let bestSlot: FreeTimeSlot | null = null;
  let bestScore = -Infinity;
  let bestReason = '';

  for (const slot of eligibleSlots) {
    let score = 100;
    const reasons: string[] = [];

    // Prefer exact or close fit to prevent fragmentation
    const slack = slot.duration - candidate.duration;
    if (slack === 0) {
      score += 30;
      reasons.push('Encaixe perfeito');
    } else if (slack <= 15) {
      score += 20;
      reasons.push('Encaixe quase exato');
    }

    // Energy requirement match
    const slotStartMin = timeToMinutes(slot.startAt);
    if (candidate.energyRequirement === 'high') {
      if (slotStartMin >= 480 && slotStartMin <= 720) {
        // Morning (08:00 - 12:00)
        score += 25;
        reasons.push('Janela ideal de alta energia matinal');
      }
    } else if (candidate.energyRequirement === 'low') {
      if (slotStartMin >= 1080) {
        // Evening (after 18:00)
        score += 20;
        reasons.push('Janela noturna para baixa energia');
      }
    }

    // Earlier slots bonus
    score -= Math.floor(slotStartMin / 60);

    if (score > bestScore) {
      bestScore = score;
      bestSlot = slot;
      bestReason = reasons.length > 0 ? reasons.join(' • ') : 'Encaixado no primeiro horário livre compatível';
    }
  }

  return bestSlot ? { slot: bestSlot, score: bestScore, reason: bestReason } : null;
}

