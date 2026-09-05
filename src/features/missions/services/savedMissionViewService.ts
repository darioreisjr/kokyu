import type { SavedMissionView } from '../types';
import { generateId, missionDb } from './missionMockDb';

export type SavedMissionViewInput = Omit<SavedMissionView, 'id' | 'createdAt' | 'updatedAt'>;

function nowIso(): string {
  return new Date().toISOString();
}

export const savedMissionViewService = {
  async getSavedMissionViews(): Promise<SavedMissionView[]> {
    return [...missionDb.savedViews];
  },

  async createSavedMissionView(input: SavedMissionViewInput): Promise<SavedMissionView> {
    const now = nowIso();
    const view: SavedMissionView = { ...input, id: generateId('view'), createdAt: now, updatedAt: now };
    missionDb.savedViews.push(view);
    return { ...view };
  },

  async updateSavedMissionView(id: string, patch: Partial<SavedMissionViewInput>): Promise<SavedMissionView | null> {
    const index = missionDb.savedViews.findIndex((v) => v.id === id);
    if (index === -1) return null;
    const updated: SavedMissionView = { ...missionDb.savedViews[index]!, ...patch, updatedAt: nowIso() };
    missionDb.savedViews[index] = updated;
    return { ...updated };
  },

  async deleteSavedMissionView(id: string): Promise<void> {
    missionDb.savedViews = missionDb.savedViews.filter((v) => v.id !== id);
  },
};
