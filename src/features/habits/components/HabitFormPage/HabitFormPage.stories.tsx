import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HabitFormPage } from './HabitFormPage';

const meta = {
  title: 'Habits/HabitFormPage',
  component: HabitFormPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HabitFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
