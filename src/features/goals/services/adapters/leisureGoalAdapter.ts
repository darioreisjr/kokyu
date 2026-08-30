import { leisureSourceSnapshot } from '../../mocks/leisureSourceData.mock';
import type { GoalProgressSource, GoalProgressSourceResult } from '../../types';

const metricValues: Record<string, number> = {
  'leisure.booksCompleted': leisureSourceSnapshot.booksCompletedThisYear,
  'leisure.moviesWatched': leisureSourceSnapshot.moviesWatchedThisYear,
  'leisure.gamesCompleted': leisureSourceSnapshot.gamesCompletedThisYear,
  'leisure.placesVisited': leisureSourceSnapshot.placesVisitedThisYear,
  'leisure.hobbyMinutes': leisureSourceSnapshot.hobbyMinutesThisYear,
};

/** Reads Tempo Livre's log (mirrored locally, see `leisureSourceData.mock.ts`) — never asks the user to type in a number Tempo Livre already tracks. */
export const leisureGoalAdapter: GoalProgressSource = {
  module: 'leisure',
  metrics: [
    { id: 'leisure.booksCompleted', module: 'leisure', label: 'Livros concluídos', unit: 'books' },
    { id: 'leisure.moviesWatched', module: 'leisure', label: 'Filmes assistidos', unit: 'times' },
    { id: 'leisure.gamesCompleted', module: 'leisure', label: 'Jogos finalizados', unit: 'times' },
    { id: 'leisure.placesVisited', module: 'leisure', label: 'Lugares visitados', unit: 'times' },
    { id: 'leisure.hobbyMinutes', module: 'leisure', label: 'Minutos em hobbies', unit: 'minutes' },
  ],
  async calculateProgress(_goal, metricId): Promise<GoalProgressSourceResult> {
    const metric = leisureGoalAdapter.metrics.find((candidate) => candidate.id === metricId);
    return {
      currentValue: metricValues[metricId] ?? 0,
      unit: metric?.unit ?? 'units',
      lastSyncAt: new Date().toISOString(),
      detail: metric ? `${metricValues[metricId] ?? 0} registrados em Tempo Livre` : undefined,
    };
  },
};
