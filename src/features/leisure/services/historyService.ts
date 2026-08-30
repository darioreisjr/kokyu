import type { LeisureLogEntry } from '../types/leisureLog.types';
import { generateId, leisureDb } from './leisureMockDb';

export type LogEntryInput = Omit<LeisureLogEntry, 'id' | 'createdAt'>;

/** Mocked — no real backend. Every call appends a new occurrence; it never mutates or replaces an existing one, so the same item can be logged any number of times. */
export const historyService = {
  async getHistory(): Promise<LeisureLogEntry[]> {
    return [...leisureDb.logEntries].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  },

  async createLogEntry(input: LogEntryInput): Promise<LeisureLogEntry> {
    const entry: LeisureLogEntry = {
      id: generateId('log'),
      createdAt: new Date().toISOString(),
      ...input,
    };
    leisureDb.logEntries.push(entry);
    return entry;
  },
};
