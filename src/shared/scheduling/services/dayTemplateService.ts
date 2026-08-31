import type { DayTemplate, ScheduleEntryInput } from '../types';
import { generateScheduleId, scheduleDb } from './scheduleMockDb';

export const dayTemplateService = {
  async getTemplates(): Promise<DayTemplate[]> {
    return scheduleDb.dayTemplates;
  },

  async getTemplateById(id: string): Promise<DayTemplate | null> {
    return scheduleDb.dayTemplates.find((t) => t.id === id) || null;
  },

  convertTemplateToEntries(template: DayTemplate, targetDate: string): ScheduleEntryInput[] {
    return template.items.map((item) => ({
      id: generateScheduleId('template-item'),
      sourceType: item.sourceType,
      sourceId: generateScheduleId('src'),
      title: item.title,
      date: targetDate,
      startAt: item.startAt,
      duration: item.duration,
      locked: item.locked ?? false,
      priority: item.priority ?? 'medium',
      energyRequirement: item.energyRequirement,
      status: 'planned',
    }));
  },
};

