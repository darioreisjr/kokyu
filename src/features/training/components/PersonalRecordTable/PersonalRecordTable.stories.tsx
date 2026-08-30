import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { trainingDb } from '../../services/trainingMockDb';
import { PersonalRecordTable } from './PersonalRecordTable';

const meta = {
  title: 'Kokyu Treinamento/PersonalRecordTable',
  component: PersonalRecordTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PersonalRecordTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The seed data has no `repPR` record by default, so this is what the page shows out of the box. */
export const Empty: Story = {
  args: { weightUnit: 'kg' },
};

/**
 * Mutates the shared mock DB to add rep-range PRs before rendering — kept last in the file since
 * Storybook doesn't reset module state between stories within a session (same convention as
 * `TrainingTodayPage.stories.tsx`/`GoalsOverviewPage.stories.tsx`).
 */
export const WithRecords: Story = {
  decorators: [
    (Story) => {
      trainingDb.personalRecords.push(
        {
          id: 'pr-story-supino-6',
          exerciseId: 'exercise-supino-reto',
          recordType: 'repPR',
          value: 70,
          reps: 6,
          achievedAt: '2026-08-20T12:00:00.000Z',
          sessionId: 'session-push-a-1',
        },
        {
          id: 'pr-story-supino-1',
          exerciseId: 'exercise-supino-reto',
          recordType: 'repPR',
          value: 85,
          reps: 1,
          achievedAt: '2026-08-22T12:00:00.000Z',
          sessionId: 'session-push-a-2',
        },
        {
          id: 'pr-story-terra-5',
          exerciseId: 'exercise-levantamento-terra',
          recordType: 'repPR',
          value: 100,
          reps: 5,
          achievedAt: '2026-08-19T12:00:00.000Z',
          sessionId: 'session-pull-a-1',
        },
      );
      return <Story />;
    },
  ],
  args: { weightUnit: 'kg' },
};
