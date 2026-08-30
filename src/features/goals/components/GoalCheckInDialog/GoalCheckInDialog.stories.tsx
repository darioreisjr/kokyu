import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GoalCheckInDialog } from './GoalCheckInDialog';

const meta = {
  title: 'Kokyu Metas/GoalCheckInDialog',
  component: GoalCheckInDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onClose: () => {}, onSave: () => {} },
} satisfies Meta<typeof GoalCheckInDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { open: true, goalTitle: 'Ler 20 livros este ano' } };
export const WithBlocker: Story = {
  args: { open: true, goalTitle: 'Reduzir tempo de tela diário' },
};
