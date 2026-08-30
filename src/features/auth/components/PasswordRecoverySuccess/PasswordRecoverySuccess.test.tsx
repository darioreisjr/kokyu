import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { PasswordRecoverySuccess } from './PasswordRecoverySuccess';

describe('PasswordRecoverySuccess', () => {
  it('renders the confirmation heading and neutral security message', () => {
    render(
      <PasswordRecoverySuccess
        email="usuario@example.com"
        isResending={false}
        resendCooldownSeconds={0}
        onResend={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Verifique seu e-mail' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Se existir uma conta associada a este endereço, você receberá as instruções para redefinir sua senha.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the submitted email', () => {
    render(
      <PasswordRecoverySuccess
        email="usuario@example.com"
        isResending={false}
        resendCooldownSeconds={0}
        onResend={vi.fn()}
      />,
    );

    expect(screen.getByText('usuario@example.com')).toBeInTheDocument();
  });

  it('moves focus to the heading on mount, for screen reader users to notice the state change', () => {
    render(
      <PasswordRecoverySuccess
        email="usuario@example.com"
        isResending={false}
        resendCooldownSeconds={0}
        onResend={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Verifique seu e-mail' })).toHaveFocus();
  });

  it('links "Voltar para entrar" back to login', () => {
    render(
      <PasswordRecoverySuccess
        email="usuario@example.com"
        isResending={false}
        resendCooldownSeconds={0}
        onResend={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Voltar para entrar' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('calls onResend when "Enviar novamente" is available and clicked', async () => {
    const onResend = vi.fn();
    const user = userEvent.setup();
    render(
      <PasswordRecoverySuccess
        email="usuario@example.com"
        isResending={false}
        resendCooldownSeconds={0}
        onResend={onResend}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Enviar novamente' }));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it('shows the cooldown countdown and disables the resend button while it is active', () => {
    render(
      <PasswordRecoverySuccess
        email="usuario@example.com"
        isResending={false}
        resendCooldownSeconds={30}
        onResend={vi.fn()}
      />,
    );

    const resendButton = screen.getByRole('button', { name: 'Enviar novamente em 30s' });
    expect(resendButton).toBeDisabled();
  });

  it('disables the resend button and shows a loading state while resending', () => {
    render(
      <PasswordRecoverySuccess
        email="usuario@example.com"
        isResending
        resendCooldownSeconds={0}
        onResend={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Enviando' })).toBeDisabled();
  });
});
