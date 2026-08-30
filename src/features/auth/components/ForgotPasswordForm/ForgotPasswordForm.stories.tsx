import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { passwordRecoveryService } from '../../services/passwordRecoveryService';
import { ForgotPasswordForm } from './ForgotPasswordForm';

// Captured once so every story can be reset to the real (instant,
// always-successful) mock before applying its own override — stories
// share this module-level singleton, so without a reset a "Loading" or
// "ServiceError" story would leak into whichever one renders next.
const originalRequestPasswordRecovery = passwordRecoveryService.requestPasswordRecovery;

const meta = {
  title: 'Kokyu Components/ForgotPasswordForm',
  component: ForgotPasswordForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => {
      passwordRecoveryService.requestPasswordRecovery = originalRequestPasswordRecovery;
      return Story();
    },
  ],
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('E-mail'), 'usuario@example.com');
  },
};

export const ValidationError: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Enviar instruções' }));
  },
};

export const Loading: Story = {
  play: async ({ canvas, userEvent }) => {
    // Never resolves — freezes the form in its loading state for this story.
    passwordRecoveryService.requestPasswordRecovery = () => new Promise(() => {});
    await userEvent.type(canvas.getByLabelText('E-mail'), 'usuario@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Enviar instruções' }));
  },
};

export const ServiceError: Story = {
  play: async ({ canvas, userEvent }) => {
    passwordRecoveryService.requestPasswordRecovery = async () => ({
      success: false,
      error: 'Não foi possível solicitar a recuperação agora. Tente novamente.',
    });
    await userEvent.type(canvas.getByLabelText('E-mail'), 'usuario@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Enviar instruções' }));
    await canvas.findByText('Não foi possível solicitar a recuperação agora. Tente novamente.');
  },
};
