import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PasswordStrength } from './PasswordStrength';

const meta = {
  title: 'Kokyu Components/PasswordStrength',
  component: PasswordStrength,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PasswordStrength>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Weak: Story = {
  args: { password: 'abc' },
};

export const Medium: Story = {
  args: { password: 'abcdefgh1' },
};

export const Strong: Story = {
  args: { password: 'Abcdefg1!' },
};
