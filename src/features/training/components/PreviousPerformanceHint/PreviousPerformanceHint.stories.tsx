import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { PerformedSet } from '../../types';
import { PreviousPerformanceHint } from './PreviousPerformanceHint';

const meta = {
  title: 'Kokyu Treinamento/PreviousPerformanceHint',
  component: PreviousPerformanceHint,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    weightUnit: 'kg',
  },
} satisfies Meta<typeof PreviousPerformanceHint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoHistory: Story = {
  args: { performedSets: null },
};

export const WithHistory: Story = {
  args: {
    performedSets: [
      {
        id: 'ps-1',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 1,
        setType: 'working',
        weightKg: 80,
        reps: 8,
        completed: true,
      },
      {
        id: 'ps-2',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 2,
        setType: 'working',
        weightKg: 80,
        reps: 7,
        completed: true,
      },
    ] satisfies PerformedSet[],
  },
};
