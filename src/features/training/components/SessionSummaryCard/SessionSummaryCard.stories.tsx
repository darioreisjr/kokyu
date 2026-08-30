import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { PerformedSet, WorkoutSession } from '../../types';
import { SessionSummaryCard } from './SessionSummaryCard';

const baseSession: WorkoutSession = {
  id: 'session-story-1',
  name: 'Push A',
  startedAt: '2026-08-20T12:00:00.000Z',
  finishedAt: '2026-08-20T13:00:00.000Z',
  durationSeconds: 3480,
  sessionExercises: [],
  status: 'completed',
  createdAt: '2026-08-20T12:00:00.000Z',
  updatedAt: '2026-08-20T13:00:00.000Z',
};

const basePerformedSets: PerformedSet[] = [
  {
    id: 'ps-1',
    sessionId: baseSession.id,
    sessionExerciseId: 'se-1',
    setNumber: 1,
    setType: 'warmup',
    weightKg: 40,
    reps: 10,
    completed: true,
  },
  {
    id: 'ps-2',
    sessionId: baseSession.id,
    sessionExerciseId: 'se-1',
    setNumber: 2,
    setType: 'working',
    weightKg: 70,
    reps: 6,
    completed: true,
  },
  {
    id: 'ps-3',
    sessionId: baseSession.id,
    sessionExerciseId: 'se-1',
    setNumber: 3,
    setType: 'working',
    weightKg: 70,
    reps: 5,
    completed: true,
  },
];

const meta = {
  title: 'Kokyu Treinamento/SessionSummaryCard',
  component: SessionSummaryCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SessionSummaryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    session: baseSession,
    performedSets: basePerformedSets,
    weightUnit: 'kg',
    onOpen: () => {},
  },
};

export const WithNewRecords: Story = {
  args: {
    session: { ...baseSession, newPersonalRecordIds: ['pr-1', 'pr-2'] },
    performedSets: basePerformedSets,
    weightUnit: 'kg',
    onOpen: () => {},
  },
};

export const InProgressDuration: Story = {
  args: {
    session: { ...baseSession, durationSeconds: undefined },
    performedSets: [],
    weightUnit: 'kg',
    onOpen: () => {},
  },
};
