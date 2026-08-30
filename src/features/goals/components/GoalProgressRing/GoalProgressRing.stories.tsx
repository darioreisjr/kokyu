import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GoalProgressRing } from './GoalProgressRing';

const meta = {
  title: 'Kokyu Metas/GoalProgressRing',
  component: GoalProgressRing,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GoalProgressRing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Numeric: Story = { args: { current: 8, target: 20, percent: 40, unit: 'books' } };
export const NearComplete: Story = {
  args: { current: 18, target: 20, percent: 90, unit: 'books' },
};
export const Complete: Story = { args: { current: 20, target: 20, percent: 100, unit: 'books' } };
