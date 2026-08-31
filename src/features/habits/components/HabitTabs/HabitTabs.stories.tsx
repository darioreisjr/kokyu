import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HabitTabs } from './HabitTabs';

const meta = {
  title: 'Habits/HabitTabs',
  component: HabitTabs,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HabitTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
