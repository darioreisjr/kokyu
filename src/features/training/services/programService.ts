import { addWeeks } from 'date-fns';

import type { TrainingProgram, TrainingProgramInput } from '../types';
import { fromDateKey, toDateKey } from '../utils/dateHelpers';
import { generateId, trainingDb } from './trainingMockDb';

/** At most one program is expected active at a time in the UI, but nothing here enforces it structurally — see `docs/training.md`. */
export const programService = {
  async getPrograms(): Promise<TrainingProgram[]> {
    return [...trainingDb.programs];
  },

  async getProgram(id: string): Promise<TrainingProgram | null> {
    return trainingDb.programs.find((program) => program.id === id) ?? null;
  },

  async getActiveProgram(): Promise<TrainingProgram | null> {
    return trainingDb.programs.find((program) => program.status === 'active') ?? null;
  },

  async createProgram(input: TrainingProgramInput): Promise<TrainingProgram> {
    const now = new Date().toISOString();
    const program: TrainingProgram = {
      ...input,
      id: generateId('program'),
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    trainingDb.programs.push(program);
    return program;
  },

  async updateProgram(
    id: string,
    patch: Partial<TrainingProgramInput>,
  ): Promise<TrainingProgram | null> {
    const index = trainingDb.programs.findIndex((program) => program.id === id);
    if (index === -1) return null;
    const updated: TrainingProgram = {
      ...trainingDb.programs[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.programs[index] = updated;
    return updated;
  },

  async startProgram(id: string, startDate: string): Promise<TrainingProgram | null> {
    const index = trainingDb.programs.findIndex((program) => program.id === id);
    if (index === -1) return null;
    const existing = trainingDb.programs[index]!;
    const endDate = toDateKey(addWeeks(fromDateKey(startDate), existing.durationWeeks));
    const updated: TrainingProgram = {
      ...existing,
      status: 'active',
      startDate,
      endDate,
      pausedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.programs[index] = updated;
    return updated;
  },

  async pauseProgram(id: string): Promise<TrainingProgram | null> {
    const index = trainingDb.programs.findIndex((program) => program.id === id);
    if (index === -1) return null;
    const updated: TrainingProgram = {
      ...trainingDb.programs[index]!,
      status: 'paused',
      pausedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    trainingDb.programs[index] = updated;
    return updated;
  },

  async resumeProgram(id: string, resumeDate?: string): Promise<TrainingProgram | null> {
    const index = trainingDb.programs.findIndex((program) => program.id === id);
    if (index === -1) return null;
    const existing = trainingDb.programs[index]!;
    const updated: TrainingProgram = {
      ...existing,
      status: 'active',
      startDate: resumeDate ?? existing.startDate,
      pausedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.programs[index] = updated;
    return updated;
  },

  async completeProgram(id: string): Promise<TrainingProgram | null> {
    const index = trainingDb.programs.findIndex((program) => program.id === id);
    if (index === -1) return null;
    const updated: TrainingProgram = {
      ...trainingDb.programs[index]!,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    };
    trainingDb.programs[index] = updated;
    return updated;
  },

  async archiveProgram(id: string): Promise<TrainingProgram | null> {
    const index = trainingDb.programs.findIndex((program) => program.id === id);
    if (index === -1) return null;
    const updated: TrainingProgram = {
      ...trainingDb.programs[index]!,
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };
    trainingDb.programs[index] = updated;
    return updated;
  },
};
