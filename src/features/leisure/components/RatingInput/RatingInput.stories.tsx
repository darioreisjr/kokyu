import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { RatingInput } from './RatingInput';

const meta = {
  title: 'Kokyu Tempo Livre/RatingInput',
  component: RatingInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    value: 3,
    onChange: fn(),
  },
} satisfies Meta<typeof RatingInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: 0 },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
};
