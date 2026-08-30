import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { trainingDb } from '../../services/trainingMockDb';
import { ExerciseLibraryPage } from './ExerciseLibraryPage';

const meta = {
  title: 'Kokyu Treinamento/ExerciseLibraryPage',
  component: ExerciseLibraryPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ExerciseLibraryPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { globals: { viewport: { value: 'mobile' } } };
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
export const Desktop: Story = { globals: { viewport: { value: 'desktop' } } };

/**
 * Mutates the shared mock DB to empty before rendering — Storybook keeps this feature's module
 * state across story navigation within one session, so this is the last story in the file on
 * purpose: reload Storybook to see the other stories with data again.
 */
export const Empty: Story = {
  decorators: [
    (Story) => {
      trainingDb.exercises = [];
      return <Story />;
    },
  ],
};
