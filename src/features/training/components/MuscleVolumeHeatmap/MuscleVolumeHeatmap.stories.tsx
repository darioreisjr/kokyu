import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { trainingDb } from '../../services/trainingMockDb';
import { MuscleVolumeHeatmap } from './MuscleVolumeHeatmap';

const meta = {
  title: 'Kokyu Treinamento/MuscleVolumeHeatmap',
  component: MuscleVolumeHeatmap,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MuscleVolumeHeatmap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Mutates the shared mock DB before rendering — kept last in the file since Storybook doesn't
 * reset module state between stories within a session (same convention as
 * `TrainingTodayPage.stories.tsx`/`GoalsOverviewPage.stories.tsx`).
 */
export const Empty: Story = {
  decorators: [
    (Story) => {
      trainingDb.sessions = [];
      return <Story />;
    },
  ],
};
