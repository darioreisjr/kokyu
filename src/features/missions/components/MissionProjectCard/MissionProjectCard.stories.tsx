import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { MissionProject } from '../../types';
import { MissionProjectCard } from './MissionProjectCard';

function buildProject(overrides: Partial<MissionProject> = {}): MissionProject {
  return {
    id: 'project-story-1',
    name: 'Lançar meu site',
    description: 'Publicar o portfólio pessoal com autenticação e domínio próprio.',
    status: 'active',
    goalIds: [],
    progressStrategy: 'completionRatio',
    tags: [],
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    ...overrides,
  };
}

const meta = {
  title: 'Missions/MissionProjectCard',
  component: MissionProjectCard,
} satisfies Meta<typeof MissionProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { project: buildProject(), progress: { completedCount: 3, eligibleCount: 8, percent: 38 } },
};

export const Empty: Story = {
  args: { project: buildProject({ description: undefined }), progress: { completedCount: 0, eligibleCount: 0, percent: 0 } },
};

export const Completed: Story = {
  args: {
    project: buildProject({ status: 'completed', completedAt: '2026-09-01T00:00:00Z' }),
    progress: { completedCount: 8, eligibleCount: 8, percent: 100 },
  },
};

export const Paused: Story = {
  args: { project: buildProject({ status: 'paused' }), progress: { completedCount: 2, eligibleCount: 8, percent: 25 } },
};
