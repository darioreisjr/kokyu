import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HomeProviderResult, LeisureHomeProjection } from '@/shared/home/types';
import { HomeLeisureSummary } from './HomeLeisureSummary';

const withPlanned: HomeProviderResult<LeisureHomeProjection> = {
  sourceType: 'leisure',
  status: 'success',
  data: {
    plannedToday: { id: 'l1', title: 'Assistir Duna: Parte Dois', type: 'movie', startTime: '21:00' },
    inProgress: null,
    backlogCount: 5,
  },
};

const withInProgress: HomeProviderResult<LeisureHomeProjection> = {
  sourceType: 'leisure',
  status: 'success',
  data: {
    plannedToday: null,
    inProgress: { id: 'l2', title: 'Duna (livro)', type: 'book' },
    backlogCount: 5,
  },
};

const meta = {
  title: 'Home/HomeLeisureSummary',
  component: HomeLeisureSummary,
  args: { onOpen: () => {} },
} satisfies Meta<typeof HomeLeisureSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlannedToday: Story = { args: { result: withPlanned } };
export const InProgress: Story = { args: { result: withInProgress } };

export const Empty: Story = {
  args: {
    result: { sourceType: 'leisure', status: 'success', data: { plannedToday: null, inProgress: null, backlogCount: 0 } },
  },
};

export const ProviderError: Story = {
  args: { result: { sourceType: 'leisure', status: 'error', data: null, error: 'boom' } },
};

export const Loading: Story = { args: { result: withPlanned, isLoading: true } };
