import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { FinishWorkoutDialog } from './FinishWorkoutDialog';

const meta = {
  title: 'Kokyu Treinamento/FinishWorkoutDialog',
  component: FinishWorkoutDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onClose: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof FinishWorkoutDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: { isSubmitting: true },
};
