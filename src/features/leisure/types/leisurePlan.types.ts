export type LeisureRecurrence = 'none' | 'daily' | 'weekly' | 'custom';

/**
 * A scheduled occurrence — never the item itself, so the same movie
 * can be watched again or the same hobby practiced every week without
 * mutating (or duplicating) `LeisureItem`. `leisureItemId` is optional
 * because a plan can also be purely ad hoc ("Sair para caminhar"
 * without ever living in the library).
 */
export interface LeisurePlanEntry {
  id: string;
  leisureItemId?: string;
  title: string;
  /** The series' anchor/start date — never the specific day being displayed, see `occurrenceDate`. */
  date: string;
  /**
   * The calendar day this instance actually falls on. Equal to `date`
   * for a `recurrence: 'none'`/`'custom'` entry; for a `'daily'`/
   * `'weekly'` entry, the backend expands one row into one occurrence
   * per day it lands on within the requested range — group/display by
   * this, not `date` (which stays the anchor so editing a later
   * occurrence never silently reschedules the series).
   */
  occurrenceDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  recurrence?: LeisureRecurrence;
  notes?: string;
  /** Prepared only — reuses Settings → Notificações, never a second notification system. No browser permission is ever requested from here. */
  reminder?: boolean;
  /** For a `'daily'`/`'weekly'` entry, reflects `occurrenceDate` specifically — completing one day never affects any other. */
  completed: boolean;
  createdAt: string;
}
