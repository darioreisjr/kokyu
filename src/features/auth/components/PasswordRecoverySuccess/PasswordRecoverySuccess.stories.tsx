import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { PasswordRecoverySuccess } from './PasswordRecoverySuccess';

const meta = {
  title: 'Kokyu Components/PasswordRecoverySuccess',
  component: PasswordRecoverySuccess,
  tags: ['autodocs'],
  args: {
    email: 'usuario@example.com',
    isResending: false,
    resendCooldownSeconds: 0,
    onResend: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PasswordRecoverySuccess>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Resending: Story = {
  args: { isResending: true },
};

export const Cooldown: Story = {
  args: { resendCooldownSeconds: 30 },
};
