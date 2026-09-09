import { apiFetchClient } from '@/lib/api/client';
import type {
  HomeProviderContext,
  HomeSectionProvider,
  LeisureHomeProjection,
} from '@/shared/home/types';

interface LeisureSummaryResponse {
  plannedToday: { id: string; title: string; type: string; startTime?: string | null } | null;
  inProgress: { id: string; title: string; type: string } | null;
  backlogCount: number;
}

/**
 * Calls the backend's purpose-built `GET /leisure/summary` instead of
 * fetching the full plan/item lists just to derive three values - one
 * lightweight request instead of two full-collection ones. "Para depois"
 * here means `type === 'unsorted'` (Quick Capture items not yet organized),
 * matching `LaterPage`'s own definition - the backend computes it the same
 * way (see LeisureSummaryRepository).
 */
export const leisureHomeProvider: HomeSectionProvider<LeisureHomeProjection> = {
  sourceType: 'leisure',
  label: 'Tempo Livre',

  async getHomeProjection(context: HomeProviderContext): Promise<LeisureHomeProjection> {
    const summary = await apiFetchClient<LeisureSummaryResponse>(
      `/leisure/summary?date=${context.date}`,
    );

    return {
      plannedToday: summary.plannedToday
        ? {
            id: summary.plannedToday.id,
            title: summary.plannedToday.title,
            type: summary.plannedToday.type,
            startTime: summary.plannedToday.startTime ?? undefined,
          }
        : null,
      inProgress: summary.inProgress
        ? { id: summary.inProgress.id, title: summary.inProgress.title, type: summary.inProgress.type }
        : null,
      backlogCount: summary.backlogCount,
    };
  },
};
