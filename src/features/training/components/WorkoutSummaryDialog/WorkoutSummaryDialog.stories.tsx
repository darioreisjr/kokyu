import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { PerformedSet, PersonalRecordCheckResult, WorkoutSession } from '../../types';
import { WorkoutSummaryDialog } from './WorkoutSummaryDialog';

const session: WorkoutSession = {
  id: 'session-1',
  routineId: 'routine-push-a',
  name: 'Push A',
  startedAt: '2026-08-29T18:00:00.000Z',
  finishedAt: '2026-08-29T18:58:00.000Z',
  durationSeconds: 3480,
  status: 'completed',
  sessionExercises: [
    {
      id: 'se-1',
      sessionId: 'session-1',
      exerciseId: 'exercise-supino-reto',
      exerciseName: 'Supino reto',
      order: 1,
      sets: [],
    },
    {
      id: 'se-2',
      sessionId: 'session-1',
      exerciseId: 'exercise-desenvolvimento-militar',
      exerciseName: 'Desenvolvimento militar',
      order: 2,
      sets: [],
    },
  ],
  createdAt: '2026-08-29T18:00:00.000Z',
  updatedAt: '2026-08-29T18:58:00.000Z',
};

const performedSets: PerformedSet[] = [
  {
    id: 'ps-1',
    sessionId: 'session-1',
    sessionExerciseId: 'se-1',
    setNumber: 1,
    setType: 'working',
    weightKg: 72.5,
    reps: 7,
    completed: true,
  },
  {
    id: 'ps-2',
    sessionId: 'session-1',
    sessionExerciseId: 'se-1',
    setNumber: 2,
    setType: 'working',
    weightKg: 72.5,
    reps: 6,
    completed: true,
  },
  {
    id: 'ps-3',
    sessionId: 'session-1',
    sessionExerciseId: 'se-2',
    setNumber: 1,
    setType: 'working',
    weightKg: 35,
    reps: 8,
    completed: true,
  },
];

const meta = {
  title: 'Kokyu Treinamento/WorkoutSummaryDialog',
  component: WorkoutSummaryDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    session,
    performedSets,
    weightUnit: 'kg',
    onClose: () => {},
  },
} satisfies Meta<typeof WorkoutSummaryDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { newRecords: [] },
};

export const WithPRs: Story = {
  args: {
    newRecords: [
      {
        exerciseId: 'exercise-supino-reto',
        recordType: 'maxWeight',
        isNewRecord: true,
        previousValue: 70,
        newValue: 72.5,
      },
      {
        exerciseId: 'exercise-supino-reto',
        recordType: 'bestEstimatedOneRepMax',
        isNewRecord: true,
        previousValue: 84,
        newValue: 89.4,
      },
    ] satisfies PersonalRecordCheckResult[],
  },
};
