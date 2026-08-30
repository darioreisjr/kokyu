import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { Goal } from '../../types';
import { GoalCard } from './GoalCard';

const baseGoal: Goal = {
  id: 'goal-1',
  title: 'Ler 20 livros este ano',
  area: 'leisure',
  type: 'numeric',
  status: 'onTrack',
  systemStatus: 'onTrack',
  priority: 'focus',
  measurement: {
    type: 'numeric',
    direction: 'increase',
    unit: 'books',
    baseline: 0,
    currentValue: 8,
    targetValue: 20,
  },
  progressMode: 'automatic',
  source: { module: 'leisure', metricId: 'leisure.booksCompleted' },
  startDate: '2026-01-01',
  targetDate: '2026-12-31',
  tags: ['2026', 'leitura'],
  checkInFrequency: 'monthly',
  createdAt: '2026-01-02T10:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
};

const milestoneGoal: Goal = {
  ...baseGoal,
  id: 'goal-2',
  title: 'Construir meu app pessoal',
  area: 'personal',
  type: 'milestone',
  measurement: { type: 'milestone' },
  progressMode: 'manual',
  source: undefined,
  milestones: [
    { id: 'm1', title: 'Definir o MVP', completed: true, order: 0 },
    { id: 'm2', title: 'Finalizar autenticação', completed: true, order: 1 },
    { id: 'm3', title: 'Publicar', completed: false, order: 2 },
  ],
};

const meta = {
  title: 'Kokyu Metas/GoalCard',
  component: GoalCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box sx={{ width: 320 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof GoalCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Automatic: Story = {
  args: { goal: baseGoal, progress: { current: 8, target: 20, percent: 40, rawPercent: 40 } },
};
export const Manual: Story = {
  args: {
    goal: { ...baseGoal, progressMode: 'manual', source: undefined },
    progress: { current: 8, target: 20, percent: 40, rawPercent: 40 },
  },
};
export const Milestones: Story = {
  args: { goal: milestoneGoal, progress: { current: 2, target: 3, percent: 67, rawPercent: 67 } },
};
export const OnTrack: Story = {
  args: {
    goal: { ...baseGoal, status: 'onTrack' },
    progress: { current: 14, target: 20, percent: 70, rawPercent: 70 },
  },
};
export const Attention: Story = {
  args: {
    goal: { ...baseGoal, status: 'attention' },
    progress: { current: 8, target: 20, percent: 40, rawPercent: 40 },
  },
};
export const AtRisk: Story = {
  args: {
    goal: { ...baseGoal, status: 'atRisk' },
    progress: { current: 4, target: 20, percent: 20, rawPercent: 20 },
  },
};
export const Completed: Story = {
  args: {
    goal: { ...baseGoal, status: 'completed' },
    progress: { current: 20, target: 20, percent: 100, rawPercent: 100 },
  },
};
export const Paused: Story = {
  args: {
    goal: { ...baseGoal, status: 'paused' },
    progress: { current: 8, target: 20, percent: 40, rawPercent: 40 },
  },
};
