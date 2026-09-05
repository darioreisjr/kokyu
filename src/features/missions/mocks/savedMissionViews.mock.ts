import type { SavedMissionView } from '../types';

export function createMockSavedMissionViews(): SavedMissionView[] {
  return [
    {
      id: 'saved-view-quick-wins',
      name: 'Missões rápidas',
      filters: { durationMax: 30, status: ['ready', 'planned'] },
      sorting: { field: 'duration', direction: 'asc' },
      grouping: 'none',
      layout: 'list',
      createdAt: '2026-08-05T09:00:00Z',
      updatedAt: '2026-08-05T09:00:00Z',
    },
    {
      id: 'saved-view-work-urgent',
      name: 'Trabalho urgente',
      filters: { areaId: ['work'], priority: ['high', 'critical'] },
      sorting: { field: 'deadline', direction: 'asc' },
      grouping: 'project',
      layout: 'list',
      createdAt: '2026-08-05T09:00:00Z',
      updatedAt: '2026-08-05T09:00:00Z',
    },
  ];
}
