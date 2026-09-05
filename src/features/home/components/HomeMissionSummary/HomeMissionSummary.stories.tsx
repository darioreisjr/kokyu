import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HomeProviderResult, MissionHomeProjection } from '@/shared/home/types';
import { HomeMissionSummary } from './HomeMissionSummary';

const withData: HomeProviderResult<MissionHomeProjection> = {
  sourceType: 'mission',
  status: 'success',
  data: {
    focusToday: { id: 'm1', title: 'Implementar Scheduler', status: 'pending', estimatedDurationMinutes: 90 },
    next: { id: 'm2', title: 'Escrever documentação', status: 'pending' },
    pendingCount: 3,
    completedCount: 2,
    overdue: [],
    waitingFollowUp: [],
  },
};

const meta = {
  title: 'Home/HomeMissionSummary',
  component: HomeMissionSummary,
  args: { onOpen: () => {} },
} satisfies Meta<typeof HomeMissionSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { result: withData } };

export const Empty: Story = {
  args: {
    result: {
      sourceType: 'mission',
      status: 'success',
      data: { focusToday: null, next: null, pendingCount: 0, completedCount: 0, overdue: [], waitingFollowUp: [] },
    },
  },
};

export const ProviderError: Story = {
  args: { result: { sourceType: 'mission', status: 'error', data: null, error: 'boom' } },
};

export const Loading: Story = { args: { result: withData, isLoading: true } };
