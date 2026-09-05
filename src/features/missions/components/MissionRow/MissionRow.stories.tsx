import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Mission } from '../../types';
import { MissionRow } from './MissionRow';

function buildMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-story-1',
    title: 'Enviar relatório mensal',
    status: 'ready',
    priority: 'medium',
    contextIds: [],
    tagIds: [],
    goalIds: [],
    scheduleEntryIds: [],
    reminderIds: [],
    progressMode: 'binary',
    source: 'manual',
    replanCount: 0,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    ...overrides,
  };
}

const meta = {
  title: 'Missions/MissionRow',
  component: MissionRow,
} satisfies Meta<typeof MissionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { mission: buildMission() } };

export const Scheduled: Story = {
  args: { mission: buildMission({ plannedDate: '2026-09-10', scheduledStartAt: '09:00', estimatedDuration: 60 }) },
};

export const Deadline: Story = {
  args: { mission: buildMission({ deadline: '2026-09-15' }) },
};

export const Overdue: Story = {
  args: { mission: buildMission({ deadline: '2020-01-01' }) },
};

export const HighPriority: Story = {
  args: { mission: buildMission({ priority: 'critical', importance: 'high' }) },
};

export const Waiting: Story = {
  args: { mission: buildMission({ status: 'waiting', waitingFor: 'Resposta do fornecedor' }) },
};

export const Blocked: Story = {
  args: { mission: buildMission(), blockedByCount: 2 },
};

export const Recurring: Story = {
  args: { mission: buildMission({ recurrenceRule: { frequency: 'monthly', basis: 'scheduledDate' } }) },
};

export const Completed: Story = {
  args: { mission: buildMission({ status: 'completed', completedAt: '2026-08-05T10:00:00Z' }) },
};
