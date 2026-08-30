import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { QuickCaptureDialog } from './QuickCaptureDialog';

const meta = {
  title: 'Kokyu Tempo Livre/QuickCaptureDialog',
  component: QuickCaptureDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof QuickCaptureDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLink: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Título'), 'Artigo interessante');
    await userEvent.type(canvas.getByLabelText('Link (opcional)'), 'https://example.com/artigo');
  },
};
