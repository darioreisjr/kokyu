import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { profileService } from '../../services/profileService';
import type * as ProfileServiceModule from '../../services/profileService';
import type { UserProfile } from '../../types/profile.types';
import { ProfilePage } from './ProfilePage';

const baseProfile: UserProfile = {
  id: 'mock-user',
  firstName: 'Dario',
  lastName: 'Reis',
  username: 'darioreis',
  bio: '',
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
      updateProfile: vi.fn(),
      updateAvatar: vi.fn(),
      removeAvatar: vi.fn(),
    },
  };
});

const mockedGetProfile = vi.mocked(profileService.getProfile);

describe('ProfilePage', () => {
  it('renders the title and description immediately', () => {
    render(<ProfilePage />);

    expect(screen.getByRole('heading', { name: 'Perfil' })).toBeInTheDocument();
    expect(
      screen.getByText('Gerencie sua identidade e suas informações no Kokyu.'),
    ).toBeInTheDocument();
  });

  it('shows a loading skeleton before the profile resolves, not an empty page', () => {
    mockedGetProfile.mockReturnValueOnce(new Promise(() => {}));
    render(<ProfilePage />);

    expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome', { exact: true })).not.toBeInTheDocument();
  });

  it('renders the form once the profile loads', async () => {
    render(<ProfilePage />);

    expect(await screen.findByLabelText('Nome', { exact: true })).toHaveValue('Dario');
    expect(screen.queryByTestId('profile-skeleton')).not.toBeInTheDocument();
  });

  it('shows a plain error message if the profile fails to load', async () => {
    mockedGetProfile.mockRejectedValueOnce(new Error('network down'));
    render(<ProfilePage />);

    expect(
      await screen.findByText('Não foi possível carregar seu perfil agora. Tente novamente.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/network down/)).not.toBeInTheDocument();
  });
});
