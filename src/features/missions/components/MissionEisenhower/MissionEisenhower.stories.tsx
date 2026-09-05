import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Mission } from '../../types';
import { MissionEisenhower } from './MissionEisenhower';

function buildMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: `mission-${Math.random()}`,
    title: 'Missão',
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

const sampleMissions: Mission[] = [
  buildMission({ title: 'Corrigir bug em produção', priority: 'critical', importance: 'high' }),
  buildMission({ title: 'Planejar próximo trimestre', priority: 'low', importance: 'high' }),
  buildMission({ title: 'Responder e-mail urgente', priority: 'high', importance: 'low' }),
  buildMission({ title: 'Organizar gaveta', priority: 'none', importance: 'low' }),
];

const meta = {
  title: 'Missions/MissionEisenhower',
  component: MissionEisenhower,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MissionEisenhower>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { missions: sampleMissions, getProjectName: () => '' } };

export const Empty: Story = { args: { missions: [], getProjectName: () => '' } };

export const Mobile: Story = {
  args: { missions: sampleMissions, getProjectName: () => '' },
  decorators: [(Story) => <div style={{ maxWidth: 390 }}><Story /></div>],
};
