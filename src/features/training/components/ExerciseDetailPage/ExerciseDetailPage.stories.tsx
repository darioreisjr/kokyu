import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExerciseDetailPage } from './ExerciseDetailPage';

const meta = {
  title: 'Kokyu Treinamento/ExerciseDetailPage',
  component: ExerciseDetailPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ExerciseDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Has personal records and workout history logged against it. */
export const WithHistory: Story = {
  args: { exerciseId: 'exercise-supino-reto' },
};

/** No personal records or workout history logged yet. */
export const NoHistory: Story = {
  args: { exerciseId: 'exercise-supino-halteres' },
};

export const NotFound: Story = {
  args: { exerciseId: 'exercise-does-not-exist' },
};

export const Mobile: Story = {
  args: { exerciseId: 'exercise-supino-reto' },
  globals: { viewport: { value: 'mobile' } },
};
export const Desktop: Story = {
  args: { exerciseId: 'exercise-supino-reto' },
  globals: { viewport: { value: 'desktop' } },
};
