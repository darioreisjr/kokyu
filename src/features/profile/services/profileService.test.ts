import { describe, expect, it, vi } from 'vitest';

import type { CurrentUser } from '@/lib/api/types';

const { mockApiFetchClient, mockUploadAvatar, mockRemoveAvatarUpload } = vi.hoisted(() => ({
  mockApiFetchClient: vi.fn(),
  mockUploadAvatar: vi.fn(),
  mockRemoveAvatarUpload: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({ apiFetchClient: mockApiFetchClient }));
vi.mock('./avatarUploadService', () => ({
  uploadAvatar: mockUploadAvatar,
  removeAvatarUpload: mockRemoveAvatarUpload,
}));

const { mapCurrentUserToProfile, mapFormDataToPayload, profileService } = await import(
  './profileService'
);

const baseCurrentUser: CurrentUser = {
  id: 'mock-user',
  email: 'dario@email.com',
  emailVerified: true,
  providers: ['email'],
  profile: {
    firstName: 'Dario',
    lastName: 'Reis',
    username: 'darioreis',
    birthDate: '2000-08-28',
    bio: 'Olá!',
    avatarUrl: null,
    countryCode: 'BR',
    region: 'SP',
    city: 'São Paulo',
  },
  profileCompletion: { completed: true, completedAt: '2024-01-01', version: 1, missingFields: [] },
  access: { canUseApplication: true, redirectTo: null },
};

describe('mapFormDataToPayload', () => {
  it('narrows form data into the backend PATCH /profile body, renaming country -> countryCode', () => {
    const payload = mapFormDataToPayload({
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'dario_reis',
      bio: 'Olá!',
      birthDate: new Date(2000, 7, 28),
      country: 'BR',
      region: 'SP',
      city: 'São Paulo',
    });

    expect(payload).toEqual({
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'dario_reis',
      bio: 'Olá!',
      birthDate: '2000-08-28',
      countryCode: 'BR',
      region: 'SP',
      city: 'São Paulo',
    });
  });
});

describe('mapCurrentUserToProfile', () => {
  it('maps the backend shape into UserProfile', () => {
    const profile = mapCurrentUserToProfile(baseCurrentUser);
    expect(profile.firstName).toBe('Dario');
    expect(profile.country).toBe('BR');
    expect(profile.birthDate).toEqual(new Date(2000, 7, 28));
    expect(profile.email).toBe('dario@email.com');
  });

  it('falls back to empty strings for nullable optional fields', () => {
    const profile = mapCurrentUserToProfile({
      ...baseCurrentUser,
      profile: { ...baseCurrentUser.profile, bio: null, region: null, city: null },
    });
    expect(profile.bio).toBe('');
    expect(profile.region).toBe('');
    expect(profile.city).toBe('');
  });
});

describe('profileService (real backend-backed implementation)', () => {
  it('getProfile calls GET /me and maps the result', async () => {
    mockApiFetchClient.mockResolvedValueOnce(baseCurrentUser);
    const profile = await profileService.getProfile();
    expect(mockApiFetchClient).toHaveBeenCalledWith('/me');
    expect(profile.firstName).toBe('Dario');
  });

  it('getProfile throws a friendly error when the request fails', async () => {
    mockApiFetchClient.mockRejectedValueOnce(new Error('network down'));
    await expect(profileService.getProfile()).rejects.toThrow(
      'Não foi possível carregar seu perfil agora.',
    );
  });

  it('updateProfile PATCHes /profile and returns the mapped profile', async () => {
    mockApiFetchClient.mockResolvedValueOnce({
      ...baseCurrentUser,
      profile: { ...baseCurrentUser.profile, firstName: 'Novo' },
    });

    const result = await profileService.updateProfile({
      firstName: 'Novo',
      lastName: 'Nome',
      username: 'novo_nome',
      bio: 'Bio atualizada',
      birthDate: '1995-05-10',
      countryCode: 'PT',
      region: 'Lisboa',
      city: 'Lisboa',
    });

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/profile',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result).toEqual({
      success: true,
      profile: expect.objectContaining({ firstName: 'Novo' }),
    });
  });

  it('updateProfile returns a friendly error on failure, never a raw one', async () => {
    mockApiFetchClient.mockRejectedValueOnce(new Error('raw backend detail'));

    const result = await profileService.updateProfile({
      firstName: 'Novo',
      lastName: 'Nome',
      username: 'novo_nome',
      bio: '',
      birthDate: '1995-05-10',
    });

    expect(result).toEqual({
      success: false,
      error: 'Não foi possível atualizar seu perfil. Tente novamente.',
    });
  });

  it('updateAvatar delegates to uploadAvatar and returns the new avatarUrl', async () => {
    mockUploadAvatar.mockResolvedValueOnce({
      ...baseCurrentUser,
      profile: { ...baseCurrentUser.profile, avatarUrl: 'https://cdn.example.com/avatar.jpg' },
    });

    const blob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
    const result = await profileService.updateAvatar(blob);

    expect(mockUploadAvatar).toHaveBeenCalledWith(blob);
    expect(result).toEqual({ success: true, avatarUrl: 'https://cdn.example.com/avatar.jpg' });
  });

  it('removeAvatar delegates to removeAvatarUpload', async () => {
    mockRemoveAvatarUpload.mockResolvedValueOnce(baseCurrentUser);
    const result = await profileService.removeAvatar();

    expect(mockRemoveAvatarUpload).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });
});
