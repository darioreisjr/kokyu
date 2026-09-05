import { getCandidatesForAvailableTime } from '@/features/daily-rhythm/adapters/candidateProviders';
import { DEFAULT_PRIORITY_WEIGHTS } from '@/shared/scheduling/constants/schedulingConstants';
import type { HomeSuggestion } from '@/shared/home/types';

/**
 * "Sugestões para agora" / "O que fazer agora?" — reuses
 * `getCandidatesForAvailableTime` (the exact call `SlotSuggestionDialog`
 * already makes for "preencher tempo livre") instead of a second
 * candidate/matching algorithm. This only ranks what that call returns.
 */
export async function getHomeSuggestions(availableMinutes: number, date?: string): Promise<HomeSuggestion[]> {
  const candidates = await getCandidatesForAvailableTime(availableMinutes, date);

  return candidates
    .map((candidate) => {
      const weight = DEFAULT_PRIORITY_WEIGHTS[candidate.priority ?? 'medium'];
      const isExact = candidate.durationMinutes === availableMinutes;
      const fitType: HomeSuggestion['fitType'] = isExact
        ? 'exact'
        : candidate.splittable && candidate.durationMinutes > availableMinutes
          ? 'split'
          : 'fits';

      const reason = isExact
        ? 'Encaixe perfeito para o tempo disponível'
        : fitType === 'split'
          ? `Pode ser dividido em um bloco de ${availableMinutes}min`
          : 'Cabe no tempo disponível';

      return { candidate, reason, fitType, weight };
    })
    .sort((a, b) => b.weight - a.weight || a.candidate.durationMinutes - b.candidate.durationMinutes)
    .map(({ weight: _weight, ...suggestion }) => suggestion);
}
