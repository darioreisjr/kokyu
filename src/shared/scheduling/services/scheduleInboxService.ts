import type {
  InboxConversionTarget,
  ScheduleInboxItem,
  ScheduleInboxItemInput,
} from '../types';
import { generateScheduleId, scheduleDb } from './scheduleMockDb';

export const scheduleInboxService = {
  async getInboxItems(): Promise<ScheduleInboxItem[]> {
    return scheduleDb.inboxItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getInboxItem(id: string): Promise<ScheduleInboxItem | null> {
    return scheduleDb.inboxItems.find((i) => i.id === id) || null;
  },

  async createInboxItem(input: ScheduleInboxItemInput): Promise<ScheduleInboxItem> {
    const item: ScheduleInboxItem = {
      id: generateScheduleId('inbox'),
      title: input.title,
      note: input.note,
      source: input.source,
      processed: false,
      createdAt: new Date().toISOString(),
    };
    scheduleDb.inboxItems.unshift(item);
    return item;
  },

  async updateInboxItem(
    id: string,
    patch: Partial<ScheduleInboxItemInput>,
  ): Promise<ScheduleInboxItem | null> {
    const index = scheduleDb.inboxItems.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const updated = { ...scheduleDb.inboxItems[index]!, ...patch };
    scheduleDb.inboxItems[index] = updated;
    return updated;
  },

  async deleteInboxItem(id: string): Promise<boolean> {
    const index = scheduleDb.inboxItems.findIndex((i) => i.id === id);
    if (index === -1) return false;
    scheduleDb.inboxItems.splice(index, 1);
    return true;
  },

  async markAsProcessed(
    id: string,
    target: InboxConversionTarget,
    targetEntityId?: string,
  ): Promise<ScheduleInboxItem | null> {
    const index = scheduleDb.inboxItems.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const updated: ScheduleInboxItem = {
      ...scheduleDb.inboxItems[index]!,
      processed: true,
      convertedTarget: target,
      convertedEntityId: targetEntityId,
    };
    scheduleDb.inboxItems[index] = updated;
    return updated;
  },
};

