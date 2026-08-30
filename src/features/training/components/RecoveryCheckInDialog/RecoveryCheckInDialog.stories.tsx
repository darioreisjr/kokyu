import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RecoveryCheckInDialog } from './RecoveryCheckInDialog';

const meta = {
  title: 'Kokyu Treinamento/RecoveryCheckInDialog',
  component: RecoveryCheckInDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onClose: () => {},
    onSubmitted: () => {},
  },
} satisfies Meta<typeof RecoveryCheckInDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = {
  args: { open: false },
};
