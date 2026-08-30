import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { LogEntryDialog } from './LogEntryDialog';

const meta = {
  title: 'Kokyu Tempo Livre/LogEntryDialog',
  component: LogEntryDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    itemTitle: 'Interestelar',
    onClose: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof LogEntryDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRating: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '5 de 5 estrelas' }));
  },
};
