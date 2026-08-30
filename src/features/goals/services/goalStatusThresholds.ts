/**
 * Centralized so no component or test ever hardcodes a magic percentage — see the spec's own
 * "Centralizar thresholds. Não espalhar 10%, 20%, etc."
 */
export const GOAL_STATUS_THRESHOLDS = {
  /** `expected - real >= this` (in percentage points) → `attention`. */
  attentionGapPoints: 10,
  /** `expected - real >= this` (in percentage points) → `atRisk`. */
  atRiskGapPoints: 20,
} as const;
