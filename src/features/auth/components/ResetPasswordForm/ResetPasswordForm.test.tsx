import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { passwordRecoveryService } from '../../services/passwordRecoveryService';
import { ResetPasswordForm } from './ResetPasswordForm';

vi.mock('../../services/passwordRecoveryService', () => ({
  passwordRecoveryService: {
    updatePassword: vi.fn(async () => ({ success: true as const })),
  },
}));

const mockedUpdatePassword = vi.mocked(passwordRecoveryService.updatePassword);
const VALID_PASSWORD = 'Abcdefgh123!';

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    mockedUpdatePassword.mockClear();
  });

  it('shows an invalid-link state instead of the form when there is no valid session', () => {
    render(<ResetPasswordForm hasValidSession={false} />);

    expect(screen.getByText('Link inválido ou expirado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicitar novo link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument();
  });

  it('renders the form when a valid session exists', () => {
    render(<ResetPasswordForm hasValidSession />);

    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar nova senha')).toBeInTheDocument();
  });

  it('requires both password fields', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm hasValidSession />);

    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    expect(await screen.findByText('Informe sua nova senha')).toBeInTheDocument();
    expect(screen.getByText('Confirme sua nova senha')).toBeInTheDocument();
    expect(mockedUpdatePassword).not.toHaveBeenCalled();
  });

  it('rejects a mismatched confirmation', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm hasValidSession />);

    await user.type(screen.getByLabelText('Nova senha'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'Different123!');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument();
  });

  it('submits successfully and shows the success state', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm hasValidSession />);

    await user.type(screen.getByLabelText('Nova senha'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmar nova senha'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    expect(await screen.findByText('Senha redefinida')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', '/login');
    expect(mockedUpdatePassword).toHaveBeenCalledWith(VALID_PASSWORD);
  });

  it('surfaces a generic error when the update fails', async () => {
    mockedUpdatePassword.mockResolvedValueOnce({
      success: false,
      error: 'Não foi possível redefinir sua senha. Tente novamente.',
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm hasValidSession />);

    await user.type(screen.getByLabelText('Nova senha'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmar nova senha'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    expect(
      await screen.findByText('Não foi possível redefinir sua senha. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
