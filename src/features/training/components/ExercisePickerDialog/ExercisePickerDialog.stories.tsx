import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { mockExercises } from '../../mocks/exercises.mock';
import { ExercisePickerDialog } from './ExercisePickerDialog';

const meta = {
  title: 'Kokyu Treinamento/ExercisePickerDialog',
  component: ExercisePickerDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
  },
} satisfies Meta<typeof ExercisePickerDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Simulates being opened to pick a superset partner — exercises already in the routine are excluded. */
export const Filtered: Story = {
  args: {
    excludeIds: mockExercises.slice(0, mockExercises.length - 3).map((exercise) => exercise.id),
  },
};

export const Empty: Story = {
  args: {
    excludeIds: mockExercises.map((exercise) => exercise.id),
  },
};
