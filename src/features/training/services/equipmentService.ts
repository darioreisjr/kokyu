import type { Equipment, EquipmentInput } from '../types';
import { generateId, trainingDb } from './trainingMockDb';

export const equipmentService = {
  async getEquipment(): Promise<Equipment[]> {
    return [...trainingDb.equipment];
  },

  async getEquipmentItem(id: string): Promise<Equipment | null> {
    return trainingDb.equipment.find((item) => item.id === id) ?? null;
  },

  async createEquipment(input: EquipmentInput): Promise<Equipment> {
    const item: Equipment = { ...input, id: generateId('equipment') };
    trainingDb.equipment.push(item);
    return item;
  },

  async updateEquipment(id: string, patch: Partial<EquipmentInput>): Promise<Equipment | null> {
    const index = trainingDb.equipment.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated: Equipment = { ...trainingDb.equipment[index]!, ...patch };
    trainingDb.equipment[index] = updated;
    return updated;
  },

  async deleteEquipment(id: string): Promise<void> {
    trainingDb.equipment = trainingDb.equipment.filter((item) => item.id !== id);
  },
};
