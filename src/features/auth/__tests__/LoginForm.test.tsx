import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../test/test-utils';
import { LoginForm } from '../components/LoginForm/LoginForm';
import { authService } from '../services/authService';

const { mockPush, mockSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: mockSearchParams,
}));

vi.mock('../services/authService', () => ({
  authService: {
    signInWithCredentials: vi.fn(async () => ({
      success: true,
      user: { id: 'mock-user', email: 'test@example.com' },
    })),
    signInWithGoogle: vi.fn(async () => ({
      success: true,
      user: { id: 'mock-google-user', email: 'mock.google.user@example.com' },
    })),
  },
}));

// `useLoginForm` funnels every successful sign-in through this resolver
// instead of pushing `destination` directly — mocked here so these
// tests exercise the wiring (it gets called, its result is what's
// pushed) without needing a real `/me` call. Defaults to a complete
// profile's outcome (the preference-based fallback, `/app`); the
// "still incomplete" case gets its own test below.
const mockResolvePostAuthDestinationClient = vi.fn(async (_fallback?: string) => '/app');
vi.mock('../utils/resolvePostAuthDestination', () => ({
  resolvePostAuthDestinationClient: (fallback?: string) =>
    mockResolvePostAuthDestinationClient(fallback),
}));

const mockedSignIn = vi.mocked(authService.signInWithCredentials);
const mockedGoogleSignIn = vi.mocked(authService.signInWithGoogle);

describe('LoginForm', () => {
  beforeEach(() => {
    mockedSignIn.mockClear();
    mockedGoogleSignIn.mockClear();
    mockPush.mockClear();
    mockSearchParams.mockReturnValue(new URLSearchParams());
    mockResolvePostAuthDestinationClient.mockClear();
    mockResolvePostAuthDestinationClient.mockImplementation(async () => '/app');
  });

  it('shows a generic error when arriving from a failed OAuth/recovery callback', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('error=auth_callback_failed'));
    render(<LoginForm />);

    expect(
      await screen.findByText('Não foi possível concluir a autenticação. Tente novamente.'),
    ).toBeInTheDocument();
  });

  it('renders the email field', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('renders the password field', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('renders the Google sign-in button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /Continuar com Google/ })).toBeInTheDocument();
  });

  it('links "Esqueci minha senha" to the recovery flow', () => {
    render(<LoginForm />);
    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('shows an error when the email is empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe seu e-mail')).toBeInTheDocument();
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it('shows an error for an invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('E-mail'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
  });

  it('shows an error when the password is empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe sua senha')).toBeInTheDocument();
  });

  it('lets the user fill in the email field', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const email = screen.getByLabelText('E-mail');
    await user.type(email, 'user@example.com');

    expect(email).toHaveValue('user@example.com');
  });

  it('lets the user fill in the password field', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const password = screen.getByLabelText('Senha');
    await user.type(password, 'super-secret');

    expect(password).toHaveValue('super-secret');
  });

  it('lets the user reveal the password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Senha'), 'super-secret');
    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
  });

  it('lets the user hide the password again', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('calls the login callback with the entered credentials when the data is valid', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com');
    await user.type(screen.getByLabelText('Senha'), 'super-secret');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith(
        {
          email: 'user@example.com',
          password: 'super-secret',
          rememberMe: false,
        },
        undefined,
      );
    });
  });

  it('surfaces the returned error when credentials sign-in fails', async () => {
    mockedSignIn.mockResolvedValueOnce({ success: false, error: 'Credenciais inválidas' });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com');
    await user.type(screen.getByLabelText('Senha'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to /app once credentials sign-in succeeds', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com');
    await user.type(screen.getByLabelText('Senha'), 'super-secret');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/app'));
  });

  it('navigates to /perfil/completar instead of /app when the resolver says the profile is incomplete', async () => {
    mockResolvePostAuthDestinationClient.mockImplementationOnce(async () => '/perfil/completar');
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com');
    await user.type(screen.getByLabelText('Senha'), 'super-secret');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/perfil/completar'));
  });

  it('calls the Google sign-in callback when the Google button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /Continuar com Google/ }));

    await waitFor(() => {
      expect(mockedGoogleSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it('navigates to /app once Google sign-in succeeds', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /Continuar com Google/ }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/app'));
  });
});
