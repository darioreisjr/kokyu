import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { trainingDb } from '../../services/trainingMockDb';
import { TrainingProgressPage } from './TrainingProgressPage';

const meta = {
  title: 'Kokyu Treinamento/TrainingProgressPage',
  component: TrainingProgressPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TrainingProgressPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { globals: { viewport: { value: 'mobile' } } };
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
export const Desktop: Story = { globals: { viewport: { value: 'desktop' } } };

/**
 * Mutates the shared mock DB to empty before rendering — kept last in the file since Storybook
 * doesn't reset module state between stories within a session (same convention as
 * `TrainingTodayPage.stories.tsx`/`GoalsOverviewPage.stories.tsx`).
 */
export const NoTrainingHistory: Story = {
  decorators: [
    (Story) => {
      trainingDb.sessions = [];
      trainingDb.performedSets = [];
      return <Story />;
    },
  ],
};
