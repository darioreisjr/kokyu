/**
 * The domains Respiração synthesizes. Distinct from `ScheduleSourceType`
 * (per schedule *entry*) — `dailyRhythm` here means "the day's schedule
 * as a whole" (current/next entries, capacity, conflicts), not one entry.
 */
export type HomeSourceType =
  | 'mission'
  | 'habit'
  | 'training'
  | 'nutrition'
  | 'goal'
  | 'leisure'
  | 'dailyRhythm';

/** What every Home Provider receives — never a full feature snapshot, just the day context. */
export interface HomeProviderContext {
  /** Logical day, `yyyy-MM-dd`. */
  date: string;
  now: Date;
  /** `HH:mm`, from `preferences.routine`. */
  dayStartsAt: string;
  dayEndsAt: string;
  weekStartsOn: 0 | 1;
}

export type HomeProviderStatus = 'success' | 'error';

/**
 * Wraps every provider's projection so one failing domain never takes
 * down the rest of the snapshot — see `HomeSnapshotService`'s
 * `Promise.allSettled` orchestration.
 */
export interface HomeProviderResult<T> {
  sourceType: HomeSourceType;
  status: HomeProviderStatus;
  data: T | null;
  error?: string;
}

/**
 * `HomeSectionProvider` — the contract every feature's Home Provider
 * implements. Each returns a *small projection* (a handful of fields),
 * never a copy of the feature's own entities — see `docs/respiration-home.md`.
 */
export interface HomeSectionProvider<T> {
  sourceType: HomeSourceType;
  label: string;
  getHomeProjection: (context: HomeProviderContext) => Promise<T>;
}
