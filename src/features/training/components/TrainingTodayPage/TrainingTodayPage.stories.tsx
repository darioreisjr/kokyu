import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { trainingDb } from '../../services/trainingMockDb';
import { toDateKey } from '../../utils/dateHelpers';
import { TrainingTodayPage } from './TrainingTodayPage';

const meta = {
  title: 'Kokyu Treinamento/TrainingTodayPage',
  component: TrainingTodayPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TrainingTodayPage>;

export default meta;

type Story = StoryObj<typeof meta>;

// Ordered deliberately: the seed-data-mutating stories (NoWorkout/Completed) run last, since
// Storybook doesn't reset module state between stories within a file — same convention as
// `features/goals/components/GoalsOverviewPage/GoalsOverviewPage.stories.tsx`.

export const Today: Story = {};

export const Mobile: Story = { globals: { viewport: { value: 'mobile' } } };
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
export const Desktop: Story = { globals: { viewport: { value: 'desktop' } } };

export const NoWorkout: Story = {
  decorators: [
    (Story) => {
      trainingDb.scheduleEntries = trainingDb.scheduleEntries.filter(
        (entry) => entry.date !== toDateKey(new Date()),
      );
      return <Story />;
    },
  ],
};

export const Completed: Story = {
  decorators: [
    (Story) => {
      const todayKey = toDateKey(new Date());
      trainingDb.scheduleEntries = trainingDb.scheduleEntries.map((entry) =>
        entry.date === todayKey
          ? { ...entry, status: 'completed', sessionId: 'session-push-a-2' }
          : entry,
      );
      return <Story />;
    },
  ],
};
