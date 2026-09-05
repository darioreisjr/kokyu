import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HabitHomeProjection, HomeProviderResult } from '@/shared/home/types';
import { HomeHabitSummary } from './HomeHabitSummary';

const withData: HomeProviderResult<HabitHomeProjection> = {
  sourceType: 'habit',
  status: 'success',
  data: {
    scheduledToday: 5,
    completedToday: 3,
    next: { id: 'h1', name: 'Beber água', icon: 'WaterDropRounded', timeOfDay: 'afternoon', isCompleted: false, canQuickComplete: true },
    currentRoutine: null,
    nextRoutine: { id: 'r1', name: 'Rotina Noturna', timeOfDay: 'evening', preferredTime: '21:00' },
  },
};

const meta = {
  title: 'Home/HomeHabitSummary',
  component: HomeHabitSummary,
  args: { onOpen: () => {} },
} satisfies Meta<typeof HomeHabitSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { result: withData } };

export const Empty: Story = {
  args: {
    result: {
      sourceType: 'habit',
      status: 'success',
      data: { scheduledToday: 0, completedToday: 0, next: null, currentRoutine: null, nextRoutine: null },
    },
  },
};

export const ProviderError: Story = {
  args: { result: { sourceType: 'habit', status: 'error', data: null, error: 'boom' } },
};

export const Loading: Story = { args: { result: withData, isLoading: true } };
