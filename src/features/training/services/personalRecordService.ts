import type { PersonalRecord } from '../types';
import { trainingDb } from './trainingMockDb';

export const personalRecordService = {
  async getPersonalRecords(exerciseId?: string): Promise<PersonalRecord[]> {
    return trainingDb.personalRecords
      .filter((record) => !exerciseId || record.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
  },
};
