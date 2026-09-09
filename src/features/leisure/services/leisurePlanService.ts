import { apiFetchClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

import type { LeisurePlanEntry } from '../types/leisurePlan.types';

export type PlanEntryInput = Omit<LeisurePlanEntry, 'id' | 'createdAt' | 'completed'> & {
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

  async deletePlanEntry(id: string): Promise<void> {
    await apiFetchClient<void>(`/leisure/plan/${id}`, { method: 'DELETE' });
  },

  async completePlanEntry(id: string): Promise<LeisurePlanEntry | null> {
    try {
      return await apiFetchClient<LeisurePlanEntry>(`/leisure/plan/${id}/complete`, {
        method: 'POST',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
