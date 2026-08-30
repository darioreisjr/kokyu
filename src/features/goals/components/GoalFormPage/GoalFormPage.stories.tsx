import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { Goal } from '../../types';
import { GoalFormPage } from './GoalFormPage';

const milestoneGoal: Goal = {
  id: 'goal-story-milestones',
  title: 'Construir meu app pessoal',
  area: 'personal',
  type: 'milestone',
  status: 'onTrack',
  systemStatus: 'onTrack',
  priority: 'medium',
  measurement: { type: 'milestone' },
  progressMode: 'manual',
  startDate: '2026-01-01',
  targetDate: '2026-12-01',
  milestones: [
    { id: 'm1', title: 'Definir o MVP', completed: true, order: 0 },
    { id: 'm2', title: 'Publicar', completed: false, order: 1 },
  ],
  tags: [],
  checkInFrequency: 'monthly',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const keyResultGoal: Goal = {
  id: 'goal-story-key-results',
  title: 'Melhorar minha carreira',
  area: 'work',
  type: 'keyResult',
  status: 'onTrack',
  systemStatus: 'onTrack',
  priority: 'focus',
  measurement: { type: 'keyResult' },
  progressMode: 'manual',
  startDate: '2026-01-01',
  keyResults: [
    {
      id: 'kr1',
      title: 'Concluir 2 cursos',
      type: 'numeric',
      baseline: 0,
      current: 1,
      target: 2,
      unit: 'units',
      weight: 50,
      status: 'inProgress',
    },
  ],
  tags: [],
  checkInFrequency: 'monthly',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const meta = {
  title: 'Kokyu Metas/GoalFormPage',
  component: GoalFormPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 700 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof GoalFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = { args: { mode: 'create' } };
export const EditingMilestoneGoal: Story = { args: { mode: 'edit', initialGoal: milestoneGoal } };
export const EditingKeyResultGoal: Story = { args: { mode: 'edit', initialGoal: keyResultGoal } };
