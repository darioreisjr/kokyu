import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GoalDetailPage } from './GoalDetailPage';

/**
 * Roda contra o mock DB real (`goalMockDb`) — cada story só escolhe qual meta semeada exibir pelo
 * `goalId`, em vez de reconstruir o estado manualmente (a página não aceita a `Goal` como prop).
 */
const meta = {
  title: 'Kokyu Metas/GoalDetailPage',
  component: GoalDetailPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GoalDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AutomaticProgress: Story = { args: { goalId: 'goal-read-20-books' } };
export const ManualProgress: Story = { args: { goalId: 'goal-reduce-screen-time' } };
export const WithMilestones: Story = { args: { goalId: 'goal-build-app' } };
export const WithKeyResults: Story = { args: { goalId: 'goal-improve-career' } };
export const Completed: Story = { args: { goalId: 'goal-learn-guitar-basics' } };
export const Paused: Story = { args: { goalId: 'goal-half-marathon' } };
