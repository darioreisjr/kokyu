import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { createAccountService } from '../../services/createAccountService';
import type * as CreateAccountServiceModule from '../../services/createAccountService';
import { CreateAccountForm } from './CreateAccountForm';

vi.mock('../../services/createAccountService', async () => {
  const actual = await vi.importActual<typeof CreateAccountServiceModule>(
    '../../services/createAccountService',
  );
  return {
    ...actual,
    createAccountService: {
      checkUsernameAvailability: vi.fn(async (username: string) =>
        username.toLowerCase() === 'admin'
          ? { available: false, reason: 'taken' as const }
          : { available: true as const },
      ),
      createAccount: vi.fn(async (payload) => ({
        success: true,
        user: {
          id: 'mock-account',
          firstName: payload.firstName,
          lastName: payload.lastName,
          username: payload.username,
        },
      })),
    },
  };
});

const mockedCheckUsername = vi.mocked(createAccountService.checkUsernameAvailability);
const mockedCreateAccount = vi.mocked(createAccountService.createAccount);

async function fillBirthDate(user: ReturnType<typeof userEvent.setup>, value: string) {
  const group = screen.getByRole('group', { name: 'Data de nascimento' });
  await user.click(group.querySelector('[aria-label="Day"]') as HTMLElement);
  await user.paste(value);
}

const VALID_PASSWORD = 'Abcdefgh123!';

async function fillRequiredNonDateFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('E-mail'), 'dario@example.com');
  await user.type(screen.getByLabelText('Nome'), 'Dario');
  await user.type(screen.getByLabelText('Sobrenome'), 'Reis');
  await user.type(screen.getByLabelText('Username'), 'dario_reis_valido');
  await user.type(screen.getByLabelText('Senha', { exact: true }), VALID_PASSWORD);
  await user.type(screen.getByLabelText('Confirmar senha'), VALID_PASSWORD);
}

describe('CreateAccountForm', () => {
  beforeEach(() => {
    mockedCheckUsername.mockClear();
    mockedCreateAccount.mockClear();
  });

  it('renders every field', () => {
    render(<CreateAccountForm />);

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Sobrenome')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Data de nascimento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Senha', { exact: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('requires every field — submitting empty shows an error for each one', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Informe seu e-mail')).toBeInTheDocument();
    expect(screen.getByText('Informe seu nome')).toBeInTheDocument();
    expect(screen.getByText('Informe seu sobrenome')).toBeInTheDocument();
    expect(screen.getByText('O username deve ter entre 3 e 30 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Informe sua data de nascimento')).toBeInTheDocument();
    expect(screen.getAllByText('Informe sua senha')[0]).toBeInTheDocument();
    expect(screen.getByText('Confirme sua senha')).toBeInTheDocument();
    expect(mockedCreateAccount).not.toHaveBeenCalled();
  });

  it('rejects a username containing a space', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.type(screen.getByLabelText('Username'), 'dario reis');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText(
        'Use letras minúsculas, números, "_" ou "." — começando com uma letra',
      ),
    ).toBeInTheDocument();
  });

  it('rejects a username shorter than 3 characters', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.type(screen.getByLabelText('Username'), 'da');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText('O username deve ter entre 3 e 30 caracteres'),
    ).toBeInTheDocument();
  });

  it('checks availability (debounced) and reports an unavailable username', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.type(screen.getByLabelText('Username'), 'admin');

    await waitFor(() => expect(mockedCheckUsername).toHaveBeenCalledWith('admin'), {
      timeout: 2000,
    });
    expect(await screen.findByText('Este username já está em uso')).toBeInTheDocument();
  });

  it('checks availability and reports an available username', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.type(screen.getByLabelText('Username'), 'novo_usuario');

    expect(
      await screen.findByText('Username disponível', {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it('does not check availability on every keystroke — only once the user pauses', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.type(screen.getByLabelText('Username'), 'novo_usuario');

    // A debounced check calls the service once per pause, not once per
    // character (11 keystrokes above).
    await waitFor(() => expect(mockedCheckUsername).toHaveBeenCalledTimes(1), { timeout: 2000 });
  });

  it('rejects a birth date in the future', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await fillBirthDate(user, '01/01/2099');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Informe uma data de nascimento válida')).toBeInTheDocument();
  });

  it('rejects someone younger than 18', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const value = `${String(seventeenYearsAgo.getDate()).padStart(2, '0')}/${String(seventeenYearsAgo.getMonth() + 1).padStart(2, '0')}/${seventeenYearsAgo.getFullYear()}`;

    await fillBirthDate(user, value);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText('Você precisa ter pelo menos 18 anos para criar uma conta'),
    ).toBeInTheDocument();
  });

  it('accepts someone whose 18th birthday is exactly today', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    const value = `${String(eighteenYearsAgo.getDate()).padStart(2, '0')}/${String(eighteenYearsAgo.getMonth() + 1).padStart(2, '0')}/${eighteenYearsAgo.getFullYear()}`;

    await fillBirthDate(user, value);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    await waitFor(() => {
      expect(
        screen.queryByText('Você precisa ter pelo menos 18 anos para criar uma conta'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows the password checklist once the field has content', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    expect(screen.queryByRole('list', { name: 'Requisitos de senha' })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Senha', { exact: true }), 'a');

    expect(screen.getByRole('list', { name: 'Requisitos de senha' })).toBeInTheDocument();
  });

  it('rejects a password missing a required character class', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.type(screen.getByLabelText('Senha', { exact: true }), 'abcdefg1');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText('A senha não atende aos requisitos mínimos'),
    ).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    const password = screen.getByLabelText('Senha', { exact: true });
    await user.type(password, VALID_PASSWORD);
    expect(password).toHaveAttribute('type', 'password');

    // Both password fields render their own "Mostrar senha" toggle;
    // the first one belongs to "Senha".
    const [showPasswordToggle] = screen.getAllByRole('button', { name: 'Mostrar senha' });
    await user.click(showPasswordToggle!);
    expect(password).toHaveAttribute('type', 'text');
  });

  it('rejects a confirmation that does not match the password', async () => {
    // Zod's object-level `.refine()` (what compares password/confirmPassword)
    // only runs once every other field resolves to *some* valid value —
    // an unset `birthDate` short-circuits it before it's reached. So the
    // rest of the form has to be valid for this check to be isolated.
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await fillRequiredNonDateFields(user);
    await fillBirthDate(user, '28/08/2000');
    await user.clear(screen.getByLabelText('Confirmar senha'));
    await user.type(screen.getByLabelText('Confirmar senha'), 'Different1!');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument();
  });

  it('submits successfully with valid data and shows the success state', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await fillRequiredNonDateFields(user);
    await fillBirthDate(user, '28/08/2000');

    await waitFor(() => expect(mockedCheckUsername).toHaveBeenCalled(), { timeout: 2000 });
    await screen.findByText('Username disponível');

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Verifique seu e-mail')).toBeInTheDocument();
    expect(
      screen.getByText('Enviamos um link de confirmação para o seu e-mail. Confirme para poder entrar.'),
    ).toBeInTheDocument();
    expect(mockedCreateAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'dario@example.com',
        firstName: 'Dario',
        lastName: 'Reis',
        username: 'dario_reis_valido',
        birthDate: '2000-08-28',
      }),
      undefined,
    );
    // `confirmPassword` must never reach the payload.
    expect(mockedCreateAccount.mock.calls[0]?.[0]).not.toHaveProperty('confirmPassword');
  });

  it('blocks submission when the chosen username is unavailable', async () => {
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await user.type(screen.getByLabelText('E-mail'), 'dario@example.com');
    await user.type(screen.getByLabelText('Nome'), 'Dario');
    await user.type(screen.getByLabelText('Sobrenome'), 'Reis');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Senha', { exact: true }), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmar senha'), VALID_PASSWORD);
    await fillBirthDate(user, '28/08/2000');

    await screen.findByText('Este username já está em uso', {}, { timeout: 2000 });

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(mockedCreateAccount).not.toHaveBeenCalled();
  });

  it('surfaces a generic error when account creation fails', async () => {
    mockedCreateAccount.mockResolvedValueOnce({
      success: false,
      error: 'Não foi possível criar sua conta. Tente novamente.',
    });
    const user = userEvent.setup();
    render(<CreateAccountForm />);

    await fillRequiredNonDateFields(user);
    await fillBirthDate(user, '28/08/2000');
    await screen.findByText('Username disponível');

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText('Não foi possível criar sua conta. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
