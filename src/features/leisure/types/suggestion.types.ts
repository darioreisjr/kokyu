import type { LeisureItem, LeisureItemStatus, LeisureItemType } from './leisureItem.types';

export type LeisureMoodId =
  'relaxar' | 'divertir' | 'aprender' | 'sair' | 'ficar-em-casa' | 'rapido' | 'longo';

export interface AvailableTimeSuggestionInput {
  /** Minutes of free time the user reports having right now. */
  durationMinutes: number;
  type?: LeisureItemType;
  /** A recognized context tag id (see `constants/contextTags.ts`), e.g. "em-casa". */
  contextTag?: string;
  mood?: LeisureMoodId;
  /** Defaults to backlog/planned/inProgress/paused — statuses worth suggesting; completed/abandoned/archived are excluded unless explicitly requested. */
  statuses?: LeisureItemStatus[];
}

export interface RankedSuggestion {
  item: LeisureItem;
  /** The duration actually used to judge fit — `estimatedDuration` for fixed items, `minimumUsefulDuration` for flexible ones. */
  effectiveDuration?: number;
}
