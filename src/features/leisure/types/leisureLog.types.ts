import type { LeisureItemType } from './leisureItem.types';

/**
 * One occurrence in the Logbook — never a copy of the item. Watching
 * the same movie twice, or practicing the same hobby every Tuesday,
 * means multiple `LeisureLogEntry` rows pointing at one `LeisureItem`.
 */
export interface LeisureLogEntry {
  id: string;
  leisureItemId?: string;
  /** Denormalized snapshot of the item's type at logging time — history stays readable even if the source item is later deleted. */
  activityType: LeisureItemType;
  /** Denormalized snapshot of the item's title — same reasoning as `activityType`. */
  title: string;
  startedAt?: string;
  completedAt: string;
  duration?: number;
  rating?: number;
  notes?: string;
  createdAt: string;
}
