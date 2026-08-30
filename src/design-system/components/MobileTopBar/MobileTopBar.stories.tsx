import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { MobileTopBar } from './MobileTopBar';

const meta = {
  title: 'Kokyu Components/MobileTopBar',
  component: MobileTopBar,
  tags: ['autodocs'],
  args: {
    title: 'Respiração',
    onMenuClick: fn(),
  },
  globals: { viewport: { value: 'mobile' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MobileTopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: { title: undefined },
};
