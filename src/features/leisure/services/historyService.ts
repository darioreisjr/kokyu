import { apiFetchClient } from '@/lib/api/client';

import type { LeisureLogEntry } from '../types/leisureLog.types';

export type LogEntryInput = Omit<LeisureLogEntry, 'id' | 'createdAt'>;

/** Every call appends a new occurrence; it never mutates or replaces an existing one, so the same item can be logged any number of times. */
export const historyService = {
  async getHistory(): Promise<LeisureLogEntry[]> {
    return apiFetchClient<LeisureLogEntry[]>('/leisure/history');
  },

  async createLogEntry(input: LogEntryInput): Promise<LeisureLogEntry> {
    return apiFetchClient<LeisureLogEntry>('/leisure/history', { method: 'POST', body: input });
  },
};
