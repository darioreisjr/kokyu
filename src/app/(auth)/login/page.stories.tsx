import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LoginPage from './page';

const meta = {
  title: 'Kokyu Pages/LoginPage',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LoginPage>;

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
