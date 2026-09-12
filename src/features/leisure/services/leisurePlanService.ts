import { apiFetchClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

import type { LeisurePlanEntry } from '../types/leisurePlan.types';

export type PlanEntryInput = Omit<
  LeisurePlanEntry,
  'id' | 'createdAt' | 'completed' | 'occurrenceDate' | 'archived' | 'archivedAt'
> & {
  completed?: boolean;
};

export const leisurePlanService = {
  async getLeisurePlan(startDate: string, endDate: string): Promise<LeisurePlanEntry[]> {
    return apiFetchClient<LeisurePlanEntry[]>(
      `/leisure/plan?startDate=${startDate}&endDate=${endDate}`,
    );
  },

  async getPlanEntriesForDate(date: string): Promise<LeisurePlanEntry[]> {
    return leisurePlanService.getLeisurePlan(date, date);
  },

  /** A single entry by id — the edit page's own fetch, independent of whatever range the planner list happened to have loaded. */
  async getPlanEntry(id: string): Promise<LeisurePlanEntry> {
    return apiFetchClient<LeisurePlanEntry>(`/leisure/plan/${id}`);
  },

  async createPlanEntry(input: PlanEntryInput): Promise<LeisurePlanEntry> {
    return apiFetchClient<LeisurePlanEntry>('/leisure/plan', { method: 'POST', body: input });
  },

  async updatePlanEntry(
    id: string,
    patch: Partial<PlanEntryInput>,
  ): Promise<LeisurePlanEntry | null> {
    try {
      return await apiFetchClient<LeisurePlanEntry>(`/leisure/plan/${id}`, {
        method: 'PATCH',
        body: patch,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  /** Plan entries are never hard-deleted — archive (reversible) is the only removal path; the backend has no `DELETE` route left to call. */
  async archivePlanEntry(id: string): Promise<LeisurePlanEntry | null> {
    try {
      return await apiFetchClient<LeisurePlanEntry>(`/leisure/plan/${id}/archive`, {
        method: 'POST',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async unarchivePlanEntry(id: string): Promise<LeisurePlanEntry | null> {
    try {
      return await apiFetchClient<LeisurePlanEntry>(`/leisure/plan/${id}/unarchive`, {
        method: 'POST',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  /** Every archived entry for the current user, flat (no recurrence expansion — an archived series is just shown once, by its own anchor date). */
  async getArchivedPlanEntries(): Promise<LeisurePlanEntry[]> {
    return apiFetchClient<LeisurePlanEntry[]>('/leisure/plan/archived');
  },

  /** `occurrenceDate` picks which day of a daily/weekly series is being completed — irrelevant (and omittable) for a `'none'`/`'custom'` entry, which has only ever had one. */
  async completePlanEntry(id: string, occurrenceDate?: string): Promise<LeisurePlanEntry | null> {
    try {
      return await apiFetchClient<LeisurePlanEntry>(`/leisure/plan/${id}/complete`, {
        method: 'POST',
        body: occurrenceDate ? { date: occurrenceDate } : undefined,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
