import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { PerformedSet, SessionExercisePrescriptionSnapshot } from '../../types';
import { WorkoutSetRow } from './WorkoutSetRow';

const prescription: SessionExercisePrescriptionSnapshot = {
  setNumber: 2,
  setType: 'working',
  targetReps: 6,
  targetRepsMax: 8,
  targetLoadKg: 70,
  restSeconds: 120,
};

const previousSet: PerformedSet = {
  id: 'ps-previous',
  sessionId: 'session-previous',
  sessionExerciseId: 'se-previous',
  setNumber: 2,
  setType: 'working',
  weightKg: 70,
  reps: 7,
  completed: true,
};

const meta = {
  title: 'Kokyu Treinamento/WorkoutSetRow',
  component: WorkoutSetRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    prescription,
    weightUnit: 'kg',
    showRpeRir: true,
    onLog: () => {},
  },
} satisfies Meta<typeof WorkoutSetRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Planned: Story = {
  args: { performedSet: undefined, previousSet },
};

export const Completed: Story = {
  args: {
    performedSet: {
      id: 'ps-1',
      sessionId: 's',
      sessionExerciseId: 'se',
      setNumber: 2,
      setType: 'working',
      weightKg: 72.5,
      reps: 7,
      completed: true,
    },
    previousSet,
  },
};

/** The PR toast itself lives at the `ActiveWorkoutPage` level (discreet Snackbar) — this shows the row after logging a value that beats every prior set. */
export const PR: Story = {
  args: {
    performedSet: {
      id: 'ps-2',
      sessionId: 's',
      sessionExerciseId: 'se',
      setNumber: 2,
      setType: 'working',
      weightKg: 80,
      reps: 8,
      completed: true,
    },
    previousSet,
  },
};
