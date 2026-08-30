import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { PlanEntryDialog } from './PlanEntryDialog';

const meta = {
  title: 'Kokyu Tempo Livre/PlanEntryDialog',
  component: PlanEntryDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof PlanEntryDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: { defaultValues: { title: 'Interestelar', date: '2026-08-29' } },
};

export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      title: 'Violão',
      date: '2026-08-29',
      startTime: '19:00',
      duration: 45,
      recurrence: 'weekly',
    },
  },
};

export const ValidationErrors: Story = {
  args: { defaultValues: undefined },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar' }));
  },
};
