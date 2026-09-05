import type { ScheduleCandidate } from '@/shared/scheduling/types';

/**
 * A ranked suggestion for "O que fazer agora?"/free time. Wraps the
 * existing `ScheduleCandidate` (from `getCandidatesForAvailableTime`,
 * `features/daily-rhythm/adapters/candidateProviders.ts`) — never a new
 * candidate model. "Sugestões", never "melhor ação" — see spec.
 */
export interface HomeSuggestion {
  candidate: ScheduleCandidate;
  reason: string;
  fitType: 'exact' | 'fits' | 'split';
}
