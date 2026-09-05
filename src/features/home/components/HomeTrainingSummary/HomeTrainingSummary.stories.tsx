import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HomeProviderResult, TrainingHomeProjection } from '@/shared/home/types';
import { HomeTrainingSummary } from './HomeTrainingSummary';

const withToday: HomeProviderResult<TrainingHomeProjection> = {
  sourceType: 'training',
  status: 'success',
  data: {
    today: { id: 't1', label: 'Push A', date: '2026-09-04', time: '19:00', status: 'planned', estimatedDurationMinutes: 60 },
    next: null,
    hasActiveSession: false,
  },
};

const meta = {
  title: 'Home/HomeTrainingSummary',
  component: HomeTrainingSummary,
  args: { onOpen: () => {} },
} satisfies Meta<typeof HomeTrainingSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Today: Story = { args: { result: withToday } };

export const NoTrainingToday: Story = {
  args: {
    result: {
      sourceType: 'training',
      status: 'success',
      data: {
        today: null,
        next: { id: 't2', label: 'Legs A', date: '2026-09-06', time: '18:00', status: 'planned' },
        hasActiveSession: false,
      },
    },
  },
};

export const Empty: Story = {
  args: {
    result: { sourceType: 'training', status: 'success', data: { today: null, next: null, hasActiveSession: false } },
  },
};

export const ProviderError: Story = {
  args: { result: { sourceType: 'training', status: 'error', data: null, error: 'boom' } },
};

export const Loading: Story = { args: { result: withToday, isLoading: true } };
