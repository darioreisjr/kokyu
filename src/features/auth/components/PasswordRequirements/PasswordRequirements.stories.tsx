import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PasswordRequirements } from './PasswordRequirements';

const meta = {
  title: 'Kokyu Components/PasswordRequirements',
  component: PasswordRequirements,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PasswordRequirements>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { password: '' },
};

export const PartiallyMet: Story = {
  args: { password: 'abcdefgh1' },
};

export const AllMet: Story = {
  args: { password: 'Abcdefgh123!' },
};
