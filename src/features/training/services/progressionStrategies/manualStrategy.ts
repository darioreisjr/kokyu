import type { ProgressionStrategy, ProgressionSuggestion } from './types';

/** The default — the system never suggests a change unless the user opts into another strategy. */
export function suggestNextManual(): ProgressionSuggestion | null {
  return null;
}

export const manualProgressionStrategy: ProgressionStrategy = {
  strategy: 'manual',
  suggestNext: suggestNextManual,
};
