import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CustomDatesPicker } from './CustomDatesPicker';

const meta = {
  title: 'Kokyu Tempo Livre/CustomDatesPicker',
  component: CustomDatesPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    value: [],
    onChange: fn(),
  },
} satisfies Meta<typeof CustomDatesPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithSelectedDates: Story = {
  args: {
    value: ['2026-06-05', '2026-06-12', '2026-06-20'],
  },
};
