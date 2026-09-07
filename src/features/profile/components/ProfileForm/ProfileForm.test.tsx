import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { createAccountService } from '@/features/auth';
import type * as CreateAccountServiceModule from '@/features/auth/services/createAccountService';
import { profileService } from '../../services/profileService';
import type * as ProfileServiceModule from '../../services/profileService';
import type { UserProfile } from '../../types/profile.types';
import { ProfileForm } from './ProfileForm';

const baseProfile: UserProfile = {
  id: 'mock-user',
  firstName: 'Dario',
  lastName: 'Reis',
  username: 'darioreis',
  bio: 'Organizando cada parte da minha rotina.',
  birthDate: new Date(2000, 7, 28),
  country: 'BR',
  region: 'SP',
  city: 'São Paulo',
  avatarUrl: null,
  email: 'dario@email.com',
};

vi.mock('../../services/profileService', async () => {
  const actual = await vi.importActual<typeof ProfileServiceModule>(
    '../../services/profileService',
  );
  return {
    ...actual,
    profileService: {
      getProfile: vi.fn(async () => baseProfile),
      updateProfile: vi.fn(
        async (payload: { firstName: string; lastName: string; birthDate: string }) => ({
          success: true as const,
          profile: {
            ...baseProfile,
            ...payload,
            birthDate: new Date(`${payload.birthDate}T00:00:00`),
          },
        }),
      ),
      updateAvatar: vi.fn(async () => ({ success: true as const, avatarUrl: 'blob:mock-avatar' })),
      removeAvatar: vi.fn(async () => ({ success: true as const })),
    },
  };
});

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

const mockedUpdateProfile = vi.mocked(profileService.updateProfile);
const mockedCheckUsername = vi.mocked(createAccountService.checkUsernameAvailability);

async function fillBirthDate(user: ReturnType<typeof userEvent.setup>, value: string) {
  const group = screen.getByRole('group', { name: 'Data de nascimento' });
  await user.click(group.querySelector('[aria-label="Day"]') as HTMLElement);
  await user.paste(value);
}

// Every `userEvent.setup()` below passes `delay: null`. ProfileForm
// re-renders on every keystroke (the live `ProfileSummary` preview
// watches several fields at once), and under a fully-parallel test
// suite run the default per-key delay leaves enough of a gap for
// typed characters to land at a stale cursor position and come out
// scrambled. Disabling the delay dispatches keystrokes back-to-back
// instead, which is robust to that — this isn't testing typing
// *speed* either way.
describe('ProfileForm', () => {
  beforeEach(() => {
    mockedUpdateProfile.mockClear();
    mockedCheckUsername.mockClear();
  });

  it('renders every field pre-filled with the loaded profile', () => {
    render(<ProfileForm profile={baseProfile} />);

    expect(screen.getByLabelText('Nome', { exact: true })).toHaveValue('Dario');
    expect(screen.getByLabelText('Sobrenome')).toHaveValue('Reis');
    expect(screen.getByLabelText('Username')).toHaveValue('darioreis');
    expect(screen.getByLabelText('Sobre você')).toHaveValue(
      'Organizando cada parte da minha rotina.',
    );
    expect(screen.getByLabelText('E-mail')).toHaveValue('dario@email.com');
  });

  it('shows the calculated age next to the birth date', () => {
    render(<ProfileForm profile={baseProfile} />);
    // baseProfile is fixed in the past; just assert the derived field exists and isn't blank.
    expect(screen.getByLabelText('Idade')).not.toHaveValue('');
  });

  it('the save button starts disabled', () => {
    render(<ProfileForm profile={baseProfile} />);
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  it('the discard button starts disabled', () => {
    render(<ProfileForm profile={baseProfile} />);
    expect(screen.getByRole('button', { name: 'Descartar alterações' })).toBeDisabled();
  });

  it('enables save once a field is changed to a valid value', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    await user.type(screen.getByLabelText('Nome', { exact: true }), ' Editado');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
    });
    expect(screen.getByRole('button', { name: 'Descartar alterações' })).toBeEnabled();
  });

  it('requires firstName and lastName — the save button disables itself rather than allowing an invalid submit', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    await user.clear(screen.getByLabelText('Nome', { exact: true }));
    await user.clear(screen.getByLabelText('Sobrenome'));
    await user.tab(); // blur "Sobrenome" — mode: 'onBlur' validates from here, not on submit

    expect(await screen.findByText('Informe seu nome')).toBeInTheDocument();
    expect(screen.getByText('Informe seu sobrenome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  it('rejects an invalid username format', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const username = screen.getByLabelText('Username');
    await user.clear(username);
    await user.type(username, 'da');
    await user.tab();

    expect(
      await screen.findByText('O username deve ter entre 3 e 30 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  it('does not re-check availability for the unchanged, already-owned username', async () => {
    render(<ProfileForm profile={baseProfile} />);

    // Give the debounce window a chance to fire, if it were going to.
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(mockedCheckUsername).not.toHaveBeenCalled();
    expect(screen.queryByText('Username disponível')).not.toBeInTheDocument();
  });

  it('checks availability once the username actually changes', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const username = screen.getByLabelText('Username');
    await user.clear(username);
    await user.type(username, 'novo_username');

    await waitFor(() => expect(mockedCheckUsername).toHaveBeenCalledWith('novo_username'), {
      timeout: 2000,
    });
    expect(await screen.findByText('Username disponível')).toBeInTheDocument();
  });

  it('reports an unavailable username and blocks saving', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const username = screen.getByLabelText('Username');
    await user.clear(username);
    await user.type(username, 'admin');

    expect(
      await screen.findByText('Este username já está em uso', {}, { timeout: 2000 }),
    ).toBeInTheDocument();

    // Unavailable blocks saving via the button itself being disabled —
    // not just a submit-time guard — so there's nothing to click.
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    expect(mockedUpdateProfile).not.toHaveBeenCalled();
  });

  it('rejects someone younger than 18', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const value = `${String(seventeenYearsAgo.getDate()).padStart(2, '0')}/${String(seventeenYearsAgo.getMonth() + 1).padStart(2, '0')}/${seventeenYearsAgo.getFullYear()}`;

    await fillBirthDate(user, value);
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Você precisa ter pelo menos 18 anos.')).toBeInTheDocument();
  });

  it('accepts someone whose 18th birthday is exactly today', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    const value = `${String(eighteenYearsAgo.getDate()).padStart(2, '0')}/${String(eighteenYearsAgo.getMonth() + 1).padStart(2, '0')}/${eighteenYearsAgo.getFullYear()}`;

    await fillBirthDate(user, value);

    await waitFor(() => {
      expect(screen.queryByText('Você precisa ter pelo menos 18 anos.')).not.toBeInTheDocument();
    });
  });

  it('accepts a bio at the 160-character limit and rejects one over it', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const bio = screen.getByLabelText('Sobre você');
    // The bio field is disabled for one render until `useHasMounted`
    // flips (see `ProfileIdentityForm`'s doc comment on why) — wait for
    // that, exactly like the rest of this suite already waits for other
    // async-settled state before interacting.
    await waitFor(() => expect(bio).toBeEnabled());
    await user.click(bio);
    // `paste()`, not 161 individual keystrokes — same value, one event.
    await user.paste('a'.repeat(161));
    await user.tab();

    expect(await screen.findByText('A bio deve ter no máximo 160 caracteres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  it('shows a live 0/160 counter for the bio', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const bio = screen.getByLabelText('Sobre você');
    await waitFor(() => expect(bio).toBeEnabled());
    await user.clear(bio);
    await user.type(bio, 'Olá');

    expect(screen.getByText('3/160')).toBeInTheDocument();
  });

  it('keeps the email field read-only', () => {
    render(<ProfileForm profile={baseProfile} />);
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('readonly');
  });

  it('saves successfully and shows the success feedback', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    await user.type(screen.getByLabelText('Nome', { exact: true }), ' Editado');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Perfil atualizado com sucesso.')).toBeInTheDocument();
    expect(mockedUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Dario Editado' }),
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    });
  });

  it('surfaces a generic error when saving fails, without leaking technical detail', async () => {
    mockedUpdateProfile.mockResolvedValueOnce({ success: false, error: 'ECONNRESET at line 42' });
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    await user.type(screen.getByLabelText('Nome', { exact: true }), ' Editado');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByText('Não foi possível atualizar seu perfil. Tente novamente.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ECONNRESET/)).not.toBeInTheDocument();
  });

  it('discards changes back to the originally loaded values', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileForm profile={baseProfile} />);

    const firstName = screen.getByLabelText('Nome', { exact: true });
    await user.type(firstName, ' Editado');
    expect(firstName).toHaveValue('Dario Editado');

    await user.click(screen.getByRole('button', { name: 'Descartar alterações' }));

    expect(firstName).toHaveValue('Dario');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    expect(mockedUpdateProfile).not.toHaveBeenCalled();
  });
});
