import type { TrainingPreferences } from '../types';
import { trainingDb } from './trainingMockDb';

export const trainingPreferencesService = {
  async getPreferences(): Promise<TrainingPreferences> {
    return { ...trainingDb.preferences };
  },

  async updatePreferences(patch: Partial<TrainingPreferences>): Promise<TrainingPreferences> {
    trainingDb.preferences = { ...trainingDb.preferences, ...patch };
    return { ...trainingDb.preferences };
  },
};
