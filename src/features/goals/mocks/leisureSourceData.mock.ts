/**
 * Tempo Livre already exists as a real feature (`features/leisure`), but `goals` can't import
 * another feature's services (see `docs/architecture.md`'s dependency rule) — this mirrors the
 * shape of its real log data closely enough for `leisureGoalAdapter` to demonstrate genuine
 * integration today, without a cross-feature import.
 */
export interface LeisureSourceSnapshot {
  booksCompletedThisYear: number;
  moviesWatchedThisYear: number;
  gamesCompletedThisYear: number;
  placesVisitedThisYear: number;
  hobbyMinutesThisYear: number;
}

export const leisureSourceSnapshot: LeisureSourceSnapshot = {
  booksCompletedThisYear: 8,
  moviesWatchedThisYear: 23,
  gamesCompletedThisYear: 3,
  placesVisitedThisYear: 5,
  hobbyMinutesThisYear: 1380,
};
