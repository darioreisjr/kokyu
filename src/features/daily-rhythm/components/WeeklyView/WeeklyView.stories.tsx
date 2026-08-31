import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WeeklyView } from './WeeklyView';

const meta = {
  title: 'Daily Rhythm/WeeklyView',
  component: WeeklyView,
} satisfies Meta<typeof WeeklyView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

