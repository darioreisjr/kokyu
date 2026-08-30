import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LeisureTabs } from './LeisureTabs';

const meta = {
  title: 'Kokyu Tempo Livre/LeisureTabs',
  component: LeisureTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true, navigation: { pathname: '/app/tempo-livre' } },
  },
} satisfies Meta<typeof LeisureTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};
