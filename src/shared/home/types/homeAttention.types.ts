import type { HomeSourceType } from './homeProvider.types';

/**
 * Deliberately not `error`/`warning`/`critical` — "Precisa de atenção" is
 * informative, never a panic UI (see `docs/respiration-home.md`). Reserve
 * `important` for the few things that actually block the day (a schedule
 * conflict), not every minor notice.
 */
export type HomeAttentionSeverity = 'info' | 'attention' | 'important';

/**
 * What a Home Provider hands back for "Precisa de atenção" — the Home
 * feature only orders and renders these, it never invents a rule of its
 * own (see `HomeAttentionService`).
 */
export interface HomeAttentionItem {
  id: string;
  sourceType: HomeSourceType;
  severity: HomeAttentionSeverity;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  createdAt: string;
}
