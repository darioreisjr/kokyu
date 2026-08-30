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
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  recurrence?: LeisureRecurrence;
  notes?: string;
  /** Prepared only — reuses Settings → Notificações, never a second notification system. No browser permission is ever requested from here. */
  reminder?: boolean;
  completed: boolean;
  createdAt: string;
}
