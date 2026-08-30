import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { mockTrainingPreferences } from '../../mocks/trainingPreferences.mock';
import type { PerformedSet, SessionExercise } from '../../types';
import { ActiveExerciseCard } from './ActiveExerciseCard';

const sessionExercise: SessionExercise = {
  id: 'se-1',
  sessionId: 'session-1',
  exerciseId: 'exercise-supino-reto',
  exerciseName: 'Supino reto',
  order: 1,
  sets: [
    { setNumber: 1, setType: 'warmup', targetReps: 10, targetLoadKg: 40, restSeconds: 60 },
    {
      setNumber: 2,
      setType: 'working',
      targetReps: 6,
      targetRepsMax: 8,
      targetLoadKg: 70,
      restSeconds: 120,
    },
    {
      setNumber: 3,
      setType: 'working',
      targetReps: 6,
      targetRepsMax: 8,
      targetLoadKg: 70,
      restSeconds: 120,
    },
  ],
};

const meta = {
  title: 'Kokyu Treinamento/ActiveExerciseCard',
  component: ActiveExerciseCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    sessionExercise,
    performedSets: [],
    previousPerformedSets: null,
    preferences: mockTrainingPreferences,
    groupedCount: 1,
    onLogSet: () => {},
    onAddSet: () => {},
    onRemoveExercise: () => {},
    onSubstitute: () => {},
    onNotesChange: () => {},
    onOpenPlateCalculator: () => {},
    onOpenWarmupCalculator: () => {},
  },
} satisfies Meta<typeof ActiveExerciseCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPreviousPerformance: Story = {
  args: {
    previousPerformedSets: [
      {
        id: 'ps-1',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 1,
        setType: 'warmup',
        weightKg: 40,
        reps: 10,
        completed: true,
      },
      {
        id: 'ps-2',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 2,
        setType: 'working',
        weightKg: 70,
        reps: 6,
        completed: true,
      },
      {
        id: 'ps-3',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 3,
        setType: 'working',
        weightKg: 70,
        reps: 6,
        completed: true,
      },
    ] satisfies PerformedSet[],
  },
};

export const Superset: Story = {
  args: { groupedCount: 2 },
};
