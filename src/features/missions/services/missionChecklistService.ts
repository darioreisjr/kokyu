import type { MissionChecklistItem } from '../types';
import { generateId, missionDb } from './missionMockDb';

function nowIso(): string {
  return new Date().toISOString();
}

export const missionChecklistService = {
  async getChecklistItems(missionId: string): Promise<MissionChecklistItem[]> {
    return missionDb.checklistItems
      .filter((item) => item.missionId === missionId)
      .sort((a, b) => a.order - b.order);
  },

  async addChecklistItem(missionId: string, text: string): Promise<MissionChecklistItem> {
    const now = nowIso();
    const existing = await missionChecklistService.getChecklistItems(missionId);
    const item: MissionChecklistItem = {
      id: generateId('checklist'),
      missionId,
      text,
      completed: false,
      order: existing.length,
      createdAt: now,
      updatedAt: now,
    };
    missionDb.checklistItems.push(item);
    return { ...item };
  },

  async updateChecklistItem(
    id: string,
    patch: Partial<Pick<MissionChecklistItem, 'text' | 'completed' | 'order'>>,
  ): Promise<MissionChecklistItem | null> {
    const index = missionDb.checklistItems.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated: MissionChecklistItem = { ...missionDb.checklistItems[index]!, ...patch, updatedAt: nowIso() };
    missionDb.checklistItems[index] = updated;
    return { ...updated };
  },

  async deleteChecklistItem(id: string): Promise<void> {
    missionDb.checklistItems = missionDb.checklistItems.filter((item) => item.id !== id);
  },
};
