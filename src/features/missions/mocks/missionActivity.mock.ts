import type { MissionActivity } from '../types';

export function createMockMissionActivity(): MissionActivity[] {
  return [
    { id: 'activity-auth-1', missionId: 'mission-auth', type: 'created', createdAt: '2026-08-10T09:00:00Z' },
    { id: 'activity-auth-2', missionId: 'mission-auth', type: 'planned', detail: 'Planejada para 15/08', createdAt: '2026-08-11T09:00:00Z' },
    { id: 'activity-auth-3', missionId: 'mission-auth', type: 'rescheduled', detail: 'Replanejada para 29/08', createdAt: '2026-08-20T09:00:00Z' },
    { id: 'activity-completed-1', missionId: 'mission-completed-1', type: 'created', createdAt: '2026-08-01T09:00:00Z' },
    { id: 'activity-completed-2', missionId: 'mission-completed-1', type: 'completed', createdAt: '2026-08-03T15:00:00Z' },
  ];
}
