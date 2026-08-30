import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CreateAccountPage from './page';

const meta = {
  title: 'Kokyu Pages/CreateAccountPage',
  component: CreateAccountPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CreateAccountPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};
