import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAccountService } from '@/features/auth';
import type * as CreateAccountServiceModule from '@/features/auth/services/createAccountService';
import { ApiError } from '@/lib/api/errors';
import type { CurrentUser } from '@/lib/api/types';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { onboardingService } from '../../services/onboardingService';
import { OnboardingForm } from './OnboardingForm';

vi.mock('../../services/onboardingService', () => ({
  onboardingService: {
    completeOnboarding: vi.fn(async (payload: Record<string, unknown>) => ({
      id: 'user-1',
      email: 'dario@email.com',
      emailVerified: true,
      providers: ['email'],
      profile: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        birthDate: payload.birthDate,
        bio: payload.bio ?? null,
        avatarUrl: null,
        countryCode: payload.countryCode ?? null,
        region: payload.region ?? null,
        city: payload.city ?? null,
      },
      profileCompletion: { completed: true, completedAt: '2024-01-01', version: 1, missingFields: [] },
      access: { canUseApplication: true, redirectTo: null },
    })),
  },
}));

vi.mock('@/features/auth/services/createAccountService', async () => {
  const actual = await vi.importActual<typeof CreateAccountServiceModule>(
    '@/features/auth/services/createAccountService',
  );
  return {
    ...actual,
    createAccountService: {
      ...actual.createAccountService,
      checkUsernameAvailability: vi.fn(async (username: string) =>
        username.toLowerCase() === 'admin'
          ? { available: false, reason: 'taken' as const }
          : { available: true as const },
      ),
    },
  };
});

const { mockPush, mockReplace, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: mockRefresh }),
}));

const mockedComplete = vi.mocked(onboardingService.completeOnboarding);
const mockedCheckUsername = vi.mocked(createAccountService.checkUsernameAvailability);

/** A brand new signup — only `firstName` bootstrapped, everything else still null (the contract's own example shape). */
const freshCurrentUser: CurrentUser = {
  id: 'user-1',
  email: 'dario@email.com',
  emailVerified: true,
  providers: ['email'],
  profile: {
    firstName: 'Dario',
    lastName: null,
    username: null,
    birthDate: null,
    bio: null,
    avatarUrl: null,
    countryCode: null,
    region: null,
    city: null,
  },
  profileCompletion: {
    completed: false,
    completedAt: null,
    version: 1,
    missingFields: ['lastName', 'username', 'birthDate'],
  },
  access: { canUseApplication: false, redirectTo: '/perfil/completar' },
};

async function fillBirthDate(user: ReturnType<typeof userEvent.setup>, value: string) {
  const group = screen.getByRole('group', { name: 'Data de nascimento' });
  await user.click(group.querySelector('[aria-label="Day"]') as HTMLElement);
  await user.paste(value);
  // `mode: 'onBlur'` — RHF only (re)validates, and so only updates
  // `formState.isValid`, once this field actually blurs. A `tab()`
  // (rather than clicking some other element) mirrors how a real user
  // moves on from the date picker next.
  await user.tab();
}

function adultBirthDate(yearsAgo = 25): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

describe('OnboardingForm', () => {
  beforeEach(() => {
    mockedComplete.mockClear();
    mockedCheckUsername.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockRefresh.mockClear();
  });

  it('prefills the bootstrapped first name, leaving the rest empty', () => {
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    expect(screen.getByLabelText('Nome', { exact: true })).toHaveValue('Dario');
    expect(screen.getByLabelText('Sobrenome')).toHaveValue('');
    expect(screen.getByLabelText('Username')).toHaveValue('');
  });

  it('the submit button starts disabled — required fields are still missing', () => {
    render(<OnboardingForm currentUser={freshCurrentUser} />);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('never blocks the submit button on the optional section alone — it only needs the required fields', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    await user.type(screen.getByLabelText('Sobrenome'), 'Reis');
    await user.type(screen.getByLabelText('Username'), 'darioreis');
    await fillBirthDate(user, adultBirthDate());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
    });
    // Bio/país/estado/cidade were never touched — still fine.
    expect(screen.getByLabelText('Sobre você')).toHaveValue('');
  });

  it('rejects an invalid username format', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    await user.type(screen.getByLabelText('Username'), 'da');
    await user.tab();

    expect(
      await screen.findByText('O username deve ter entre 3 e 30 caracteres'),
    ).toBeInTheDocument();
  });

  it('checks availability and blocks submit for a taken username', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    await user.type(screen.getByLabelText('Username'), 'admin');

    expect(
      await screen.findByText('Este username já está em uso', {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('shows "Verificando..." then "Disponível" for a well-formed, free username', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    await user.type(screen.getByLabelText('Username'), 'novo_username');

    expect(await screen.findByText('Username disponível')).toBeInTheDocument();
    expect(mockedCheckUsername).toHaveBeenCalledWith('novo_username');
  });

  it('rejects someone younger than 18', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const value = `${String(seventeenYearsAgo.getDate()).padStart(2, '0')}/${String(seventeenYearsAgo.getMonth() + 1).padStart(2, '0')}/${seventeenYearsAgo.getFullYear()}`;

    await fillBirthDate(user, value);
    await user.tab();

    expect(await screen.findByText('Você precisa ter pelo menos 18 anos.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('rejects a bio over the 160-character limit, without blocking the required fields', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    const bio = screen.getByLabelText('Sobre você');
    // The bio field is disabled for one render until `useHasMounted`
    // flips (see `ProfileIdentityForm`'s doc comment on why) — wait for
    // that before interacting.
    await waitFor(() => expect(bio).toBeEnabled());
    await user.click(bio);
    await user.paste('a'.repeat(161));
    await user.tab();

    expect(await screen.findByText('A bio deve ter no máximo 160 caracteres')).toBeInTheDocument();
  });

  it('submits successfully and lands on /app', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    await user.type(screen.getByLabelText('Sobrenome'), 'Reis');
    await user.type(screen.getByLabelText('Username'), 'darioreis');
    await fillBirthDate(user, adultBirthDate());

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(mockedComplete).toHaveBeenCalled());
    expect(mockedComplete).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Dario', lastName: 'Reis', username: 'darioreis' }),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/app'));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('lands on returnTo instead of /app when one was given', async () => {
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} returnTo="/app/treinamento" />);

    await user.type(screen.getByLabelText('Sobrenome'), 'Reis');
    await user.type(screen.getByLabelText('Username'), 'darioreis');
    await fillBirthDate(user, adultBirthDate());

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/app/treinamento'));
  });

  it('shows the USERNAME_TAKEN race on the username field when the backend rejects it at submit time', async () => {
    mockedComplete.mockRejectedValueOnce(
      new ApiError(409, { code: 'USERNAME_TAKEN', detail: 'Username taken' }, 'taken'),
    );
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    await user.type(screen.getByLabelText('Sobrenome'), 'Reis');
    await user.type(screen.getByLabelText('Username'), 'darioreis');
    await fillBirthDate(user, adultBirthDate());

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Este username já está em uso.')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('surfaces a generic error for any other submit failure', async () => {
    mockedComplete.mockRejectedValueOnce(new Error('network down'));
    const user = userEvent.setup({ delay: null });
    render(<OnboardingForm currentUser={freshCurrentUser} />);

    await user.type(screen.getByLabelText('Sobrenome'), 'Reis');
    await user.type(screen.getByLabelText('Username'), 'darioreis');
    await fillBirthDate(user, adultBirthDate());

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByText('Não foi possível concluir seu perfil. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
