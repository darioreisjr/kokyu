import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { passwordRecoveryService } from '../../services/passwordRecoveryService';
import { ForgotPasswordForm } from './ForgotPasswordForm';

vi.mock('../../services/passwordRecoveryService', () => ({
  passwordRecoveryService: {
    requestPasswordRecovery: vi.fn(async () => ({ success: true as const })),
  },
}));

const mockedRequestRecovery = vi.mocked(passwordRecoveryService.requestPasswordRecovery);

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    mockedRequestRecovery.mockClear();
  });

  it('renders the email field', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole('button', { name: 'Enviar instruções' })).toBeInTheDocument();
  });

  it('requires an email — submitting empty shows an error', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(await screen.findByText('Informe seu e-mail')).toBeInTheDocument();
    expect(mockedRequestRecovery).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'email-invalido');
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
  });

  it('submits a valid, normalized email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), '  Usuario@Example.COM  ');
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    await waitFor(() => {
      expect(mockedRequestRecovery).toHaveBeenCalledWith(
        { email: 'usuario@example.com' },
        undefined,
      );
    });
  });

  it('shows the success state after a successful request', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'usuario@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(
      await screen.findByRole('heading', { name: 'Verifique seu e-mail' }),
    ).toBeInTheDocument();
    expect(screen.getByText('usuario@example.com')).toBeInTheDocument();
    // The form fields are gone — replaced by the confirmation, not shown alongside it.
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
  });

  it('never reveals whether the email belongs to a registered account', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'ninguem-tem-essa-conta@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    await screen.findByRole('heading', { name: 'Verifique seu e-mail' });

    const forbiddenPhrases = [
      /não encontrado/i,
      /não cadastrado/i,
      /conta inexistente/i,
      /usuário não encontrado/i,
      /email não encontrado/i,
    ];
    const pageText = document.body.textContent ?? '';
    for (const phrase of forbiddenPhrases) {
      expect(pageText).not.toMatch(phrase);
    }
    expect(
      screen.getByText(
        'Se existir uma conta associada a este endereço, você receberá as instruções para redefinir sua senha.',
      ),
    ).toBeInTheDocument();
  });

  it('surfaces a generic error when the service fails, without technical detail', async () => {
    mockedRequestRecovery.mockResolvedValueOnce({
      success: false,
      error: 'boom: stack trace here',
    });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'usuario@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(
      await screen.findByText('Não foi possível solicitar a recuperação agora. Tente novamente.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
    // The form is still usable after an error — the user can just try again.
    expect(screen.getByRole('button', { name: 'Enviar instruções' })).toBeEnabled();
  });

  it('disables the submit button while the request is pending', async () => {
    let resolveRequest!: (value: { success: true }) => void;
    mockedRequestRecovery.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'usuario@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(await screen.findByRole('button', { name: 'Enviando' })).toBeDisabled();

    resolveRequest({ success: true });
    await screen.findByRole('heading', { name: 'Verifique seu e-mail' });
  });
});

describe('ForgotPasswordForm — resend cooldown', () => {
  beforeEach(() => {
    mockedRequestRecovery.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts the resend cooldown after success and re-enables it once the cooldown elapses', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'usuario@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));
    await screen.findByRole('heading', { name: 'Verifique seu e-mail' });

    expect(screen.getByRole('button', { name: 'Enviar novamente em 30s' })).toBeDisabled();

    await vi.advanceTimersByTimeAsync(30_000);

    const resendButton = await screen.findByRole('button', { name: 'Enviar novamente' });
    expect(resendButton).toBeEnabled();

    await user.click(resendButton);
    await waitFor(() => expect(mockedRequestRecovery).toHaveBeenCalledTimes(2));
  });
});
