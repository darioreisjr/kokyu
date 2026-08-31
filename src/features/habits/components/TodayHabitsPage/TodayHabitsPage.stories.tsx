import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TodayHabitsPage } from './TodayHabitsPage';

const meta = {
  title: 'Habits/TodayHabitsPage',
  component: TodayHabitsPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TodayHabitsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
