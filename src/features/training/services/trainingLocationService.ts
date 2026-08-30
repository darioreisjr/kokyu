import type { TrainingLocation, TrainingLocationInput } from '../types';
import { generateId, trainingDb } from './trainingMockDb';

export const trainingLocationService = {
  async getLocations(): Promise<TrainingLocation[]> {
    return [...trainingDb.locations];
  },

  async getLocation(id: string): Promise<TrainingLocation | null> {
    return trainingDb.locations.find((location) => location.id === id) ?? null;
  },

  async createLocation(input: TrainingLocationInput): Promise<TrainingLocation> {
    const location: TrainingLocation = { ...input, id: generateId('location') };
    trainingDb.locations.push(location);
    return location;
  },

  async updateLocation(
    id: string,
    patch: Partial<TrainingLocationInput>,
  ): Promise<TrainingLocation | null> {
    const index = trainingDb.locations.findIndex((location) => location.id === id);
    if (index === -1) return null;
    const updated: TrainingLocation = { ...trainingDb.locations[index]!, ...patch };
    trainingDb.locations[index] = updated;
    return updated;
  },

  async deleteLocation(id: string): Promise<void> {
    trainingDb.locations = trainingDb.locations.filter((location) => location.id !== id);
  },
};
