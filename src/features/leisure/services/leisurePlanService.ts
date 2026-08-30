import type { LeisurePlanEntry } from '../types/leisurePlan.types';
import { generateId, leisureDb } from './leisureMockDb';

export type PlanEntryInput = Omit<LeisurePlanEntry, 'id' | 'createdAt' | 'completed'> & {
  completed?: boolean;
};

/** Mocked — no real backend. */
export const leisurePlanService = {
  async getLeisurePlan(startDate: string, endDate: string): Promise<LeisurePlanEntry[]> {
    return leisureDb.planEntries.filter(
      (entry) => entry.date >= startDate && entry.date <= endDate,
    );
  },

  async getPlanEntriesForDate(date: string): Promise<LeisurePlanEntry[]> {
    return leisureDb.planEntries.filter((entry) => entry.date === date);
  },

  async createPlanEntry(input: PlanEntryInput): Promise<LeisurePlanEntry> {
    const entry: LeisurePlanEntry = {
      id: generateId('plan'),
      completed: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    leisureDb.planEntries.push(entry);
    return entry;
  },

  async updatePlanEntry(
    id: string,
    patch: Partial<PlanEntryInput>,
  ): Promise<LeisurePlanEntry | null> {
    const index = leisureDb.planEntries.findIndex((entry) => entry.id === id);
    if (index === -1) return null;
    const updated = { ...leisureDb.planEntries[index]!, ...patch };
    leisureDb.planEntries[index] = updated;
    return updated;
  },

  async deletePlanEntry(id: string): Promise<void> {
    leisureDb.planEntries = leisureDb.planEntries.filter((entry) => entry.id !== id);
  },

  async completePlanEntry(id: string): Promise<LeisurePlanEntry | null> {
    return leisurePlanService.updatePlanEntry(id, { completed: true });
  },
};
