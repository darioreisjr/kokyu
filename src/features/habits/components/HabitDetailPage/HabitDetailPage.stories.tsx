import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HabitDetailPage } from './HabitDetailPage';

const meta = {
  title: 'Habits/HabitDetailPage',
  component: HabitDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HabitDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    habitId: 'habit-1',
  },
};
