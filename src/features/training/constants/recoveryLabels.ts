import type { RecoveryLabel } from '../types';

/** Wellness framing only — never a medical/diagnostic claim (per the spec's own explicit instruction). */
export const recoveryLabels: Record<RecoveryLabel, string> = {
  recentlyTrained: 'Treinado recentemente',
  partiallyRested: 'Descanso intermediário',
  wellRested: 'Mais descansado',
};
