import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { GoalHomeProjection, HomeProviderResult } from '@/shared/home/types';
import { HomeGoalSummary } from './HomeGoalSummary';

const withData: HomeProviderResult<GoalHomeProjection> = {
  sourceType: 'goal',
  status: 'success',
  data: {
    inFocus: [
      { id: 'g1', title: 'Correr 10km', status: 'onTrack', progressPercent: 62, nextMilestoneTitle: 'Correr 8km sem parar' },
      { id: 'g2', title: 'Ler 12 livros', status: 'attention', progressPercent: 30 },
    ],
    atRisk: [],
    pendingCheckIns: 1,
  },
};

const meta = {
  title: 'Home/HomeGoalSummary',
  component: HomeGoalSummary,
  args: { onOpen: () => {} },
} satisfies Meta<typeof HomeGoalSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { result: withData } };

export const Empty: Story = {
  args: { result: { sourceType: 'goal', status: 'success', data: { inFocus: [], atRisk: [], pendingCheckIns: 0 } } },
};

export const ProviderError: Story = {
  args: { result: { sourceType: 'goal', status: 'error', data: null, error: 'boom' } },
};

export const Loading: Story = { args: { result: withData, isLoading: true } };
