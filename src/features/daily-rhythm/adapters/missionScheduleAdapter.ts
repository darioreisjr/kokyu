import type { ScheduleEntry, ScheduleSourceAdapter } from '@/shared/scheduling/types';
import { addMinutesToTime } from '@/shared/scheduling/utils/timeHelpers';

interface MockMission {
  id: string;
  title: string;
  description?: string;
  date: string;
  startAt?: string;
  duration: number;
  priority: 'low' | 'medium' | 'high' | 'focus';
  splittable?: boolean;
  minChunkDuration?: number;
  completed: boolean;
}

let mockMissionsDb: MockMission[] = [
  {
    id: 'mission-dev-1',
    title: 'Implementar Arquitetura do Scheduler',
    description: 'Criar adaptadores e motor de agendamento.',
    date: new Date().toISOString().split('T')[0]!,
    duration: 90,
    priority: 'focus',
    splittable: true,
    minChunkDuration: 30,
    completed: false,
  },
  {
    id: 'mission-docs-2',
    title: 'Escrever Documentação Técnica',
    description: 'Atualizar guias do sistema de agendamento.',
    date: new Date().toISOString().split('T')[0]!,
    duration: 45,
    priority: 'medium',
    splittable: false,
    completed: false,
  },
];

export function resetMissionDb(): void {
  mockMissionsDb = [
    {
      id: 'mission-dev-1',
      title: 'Implementar Arquitetura do Scheduler',
      description: 'Criar adaptadores e motor de agendamento.',
      date: new Date().toISOString().split('T')[0]!,
      duration: 90,
      priority: 'focus',
      splittable: true,
      minChunkDuration: 30,
      completed: false,
    },
    {
      id: 'mission-docs-2',
      title: 'Escrever Documentação Técnica',
      description: 'Atualizar guias do sistema de agendamento.',
      date: new Date().toISOString().split('T')[0]!,
      duration: 45,
      priority: 'medium',
      splittable: false,
      completed: false,
    },
  ];
}

export const missionScheduleAdapter: ScheduleSourceAdapter = {
  sourceType: 'mission',
  label: 'Missões',

  async getEntriesForDate(date: string): Promise<ScheduleEntry[]> {
    const missions = mockMissionsDb.filter((m) => m.date === date);

    return missions.map((m) => {
      const startAt = m.startAt;
      const endAt = startAt ? addMinutesToTime(startAt, m.duration) : undefined;

      return {
        id: `mission-${m.id}`,
        sourceType: 'mission',
        sourceId: m.id,
        title: m.title,
        description: m.description,
        date: m.date,
        startAt,
        endAt,
        duration: m.duration,
        allDay: false,
        flexible: !m.startAt,
        locked: false,
        splittable: m.splittable,
        minChunkDuration: m.minChunkDuration,
        status: m.completed ? 'completed' : 'planned',
        priority: m.priority,
        context: 'work',
        colorToken: 'schedule.source.mission',
        icon: 'AssignmentRounded',
        syncMode: 'bidirectional',
        createdAt: '2026-08-30T00:00:00Z',
        updatedAt: '2026-08-30T00:00:00Z',
      };
    });
  },

  async getUnscheduledEntries(date: string): Promise<ScheduleEntry[]> {
    const entries = await missionScheduleAdapter.getEntriesForDate(date);
    return entries.filter((e) => !e.startAt && e.status === 'planned');
  },

  async onEntryCompleted(entry: ScheduleEntry): Promise<boolean> {
    const mission = mockMissionsDb.find((m) => m.id === entry.sourceId);
    if (mission) {
      mission.completed = true;
      return true;
    }
    return false;
  },

  async onEntryRescheduled(
    entry: ScheduleEntry,
    newDate: string,
    newStartAt?: string,
  ): Promise<boolean> {
    const mission = mockMissionsDb.find((m) => m.id === entry.sourceId);
    if (mission) {
      mission.date = newDate;
      mission.startAt = newStartAt;
      return true;
    }
    return false;
  },
};

