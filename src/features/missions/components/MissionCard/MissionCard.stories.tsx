import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Mission } from '../../types';
import { MissionCard } from './MissionCard';

function buildMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-story-1',
    title: 'Finalizar autenticação',
    status: 'ready',
    priority: 'high',
    contextIds: [],
    tagIds: [],
    goalIds: [],
    scheduleEntryIds: [],
    reminderIds: [],
    progressMode: 'checklist',
    source: 'manual',
    replanCount: 0,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    ...overrides,
  };
}

const meta = {
  title: 'Missions/MissionCard',
  component: MissionCard,
} satisfies Meta<typeof MissionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { mission: buildMission() } };

export const WithProject: Story = {
  args: { mission: buildMission({ projectId: 'project-portfolio' }), projectName: 'Lançar meu site' },
};

export const WithGoal: Story = {
  args: { mission: buildMission({ goalIds: ['goal-launch-app'] }), goalLabel: 'Lançar Kokyu' },
};

export const WithDuration: Story = {
  args: { mission: buildMission({ estimatedDuration: 90, actualDurationMinutes: 105 }) },
};

export const WithDependencies: Story = {
  args: { mission: buildMission(), dependenciesCount: 2 },
};
