import { leisureItemService } from '@/features/leisure/services/leisureItemService';
import { leisurePlanService } from '@/features/leisure/services/leisurePlanService';
import type {
  HomeProviderContext,
  HomeSectionProvider,
  LeisureHomeProjection,
} from '@/shared/home/types';

/**
 * Reads `leisurePlanService`/`leisureItemService` — the same services
 * `useLeisureToday` reads for "Hoje" — for today's planned activity, any
 * item already in progress, and the backlog count. "Para depois" here
 * means `type === 'unsorted'` (Quick Capture items not yet organized),
 * matching `LaterPage`'s own definition — not `status === 'backlog'`,
 * which is a separate lifecycle state.
 */
export const leisureHomeProvider: HomeSectionProvider<LeisureHomeProjection> = {
  sourceType: 'leisure',
  label: 'Tempo Livre',

  async getHomeProjection(context: HomeProviderContext): Promise<LeisureHomeProjection> {
    const [planEntries, items] = await Promise.all([
      leisurePlanService.getPlanEntriesForDate(context.date),
      leisureItemService.getLeisureItems(),
    ]);

    const itemById = new Map(items.map((item) => [item.id, item]));

    const plannedEntry = [...planEntries]
      .filter((entry) => !entry.completed)
      .sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'))[0];

    const inProgressItem = items.find((item) => item.status === 'inProgress');

    return {
      plannedToday: plannedEntry
        ? {
            id: plannedEntry.id,
            title: plannedEntry.title,
            type: plannedEntry.leisureItemId ? (itemById.get(plannedEntry.leisureItemId)?.type ?? 'custom') : 'custom',
            startTime: plannedEntry.startTime,
          }
        : null,
      inProgress: inProgressItem
        ? { id: inProgressItem.id, title: inProgressItem.title, type: inProgressItem.type }
        : null,
      backlogCount: items.filter((item) => item.type === 'unsorted').length,
    };
  },
};
