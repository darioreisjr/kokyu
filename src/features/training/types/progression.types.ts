export type ProgressionStrategyType =
  'manual' | 'linear' | 'doubleProgression' | 'percentOfTrainingMax';

/** The default — the system never touches load unless the user explicitly opts into a strategy below. */
export interface ManualProgressionConfig {
  strategy: 'manual';
}

export interface LinearProgressionConfig {
  strategy: 'linear';
  incrementKg: number;
  /** Consecutive sessions where every set hit its target before a bump is suggested. */
  incrementAfterSuccesses: number;
}

/** Classic 8–12-style range: bump only once every working set reaches the top of the range. */
export interface DoubleProgressionConfig {
  strategy: 'doubleProgression';
  repRangeMin: number;
  repRangeMax: number;
  incrementKg: number;
}

export interface PercentOfTrainingMaxConfig {
  strategy: 'percentOfTrainingMax';
  trainingMaxKg: number;
  percentOfMax: number;
}

export type ProgressionConfig =
  | ManualProgressionConfig
  | LinearProgressionConfig
  | DoubleProgressionConfig
  | PercentOfTrainingMaxConfig;
