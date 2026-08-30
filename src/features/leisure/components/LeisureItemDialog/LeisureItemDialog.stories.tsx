import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { leisureItemFormDefaultValues } from '../../schemas/leisureItemSchema';
import { LeisureItemDialog } from './LeisureItemDialog';

const meta = {
  title: 'Kokyu Tempo Livre/LeisureItemDialog',
  component: LeisureItemDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof LeisureItemDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewItem: Story = {};

export const EditingABook: Story = {
  args: {
    defaultValues: {
      ...leisureItemFormDefaultValues,
      title: 'O Hobbit',
      type: 'book',
      author: 'J.R.R. Tolkien',
      pages: 310,
    },
  },
};

export const LockedToHobby: Story = {
  args: { lockedType: 'hobby' },
};

export const ValidationErrors: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar' }));
  },
};
