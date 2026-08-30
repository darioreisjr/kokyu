import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuLogo } from './KokyuLogo';

const meta = {
  title: 'Kokyu Components/KokyuLogo',
  component: KokyuLogo,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof KokyuLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const MarkOnly: Story = {
  args: { markOnly: true },
};
