import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { DailyCapacity } from '@/shared/scheduling/types';
import { HomeCapacity } from './HomeCapacity';

const balanced: DailyCapacity = {
  date: '2026-09-04',
  totalDayDurationMinutes: 1020,
  fixedBlockedMinutes: 240,
  availableMinutes: 780,
  plannedWorkloadMinutes: 400,
  utilizationPercent: 51,
  status: 'balanced',
  differenceMinutes: 380,
};

const overcapacity: DailyCapacity = {
  ...balanced,
  plannedWorkloadMinutes: 840,
  utilizationPercent: 108,
  status: 'overcapacity',
  differenceMinutes: 60,
};

const meta = {
  title: 'Home/HomeCapacity',
  component: HomeCapacity,
  args: { now: new Date('2026-09-04T14:30:00'), showCapacity: true, hasAnyEntry: true, onOpenPlanning: () => {} },
} satisfies Meta<typeof HomeCapacity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Balanced: Story = { args: { capacity: balanced } };
export const OverCapacity: Story = { args: { capacity: overcapacity } };
export const Unplanned: Story = { args: { capacity: null, hasAnyEntry: false } };
export const CapacityHiddenByPreference: Story = { args: { capacity: balanced, showCapacity: false } };
export const Loading: Story = { args: { capacity: null, isLoading: true } };
