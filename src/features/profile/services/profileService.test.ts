import { describe, expect, it } from 'vitest';

import { mapFormDataToPayload, profileService } from './profileService';

describe('mapFormDataToPayload', () => {
  it('narrows form data into a payload, formatting the birth date', () => {
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
      country: 'BR',
      region: 'SP',
      city: 'São Paulo',
    });
  });
});

describe('profileService (mock provider)', () => {
  it('resolves getProfile with a plausible profile', async () => {
    const profile = await profileService.getProfile();
    expect(profile.firstName).toBeTruthy();
    expect(profile.email).toContain('@');
    expect(profile.birthDate).toBeInstanceOf(Date);
  });

  it('updateProfile persists the given fields and returns them back', async () => {
    const result = await profileService.updateProfile({
      firstName: 'Novo',
      lastName: 'Nome',
      username: 'novo_nome',
      bio: 'Bio atualizada',
      birthDate: '1995-05-10',
      country: 'PT',
      region: 'Lisboa',
      city: 'Lisboa',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.profile.firstName).toBe('Novo');
      expect(result.profile.bio).toBe('Bio atualizada');
      expect(result.profile.birthDate).toEqual(new Date(1995, 4, 10));
    }

    const reloaded = await profileService.getProfile();
    expect(reloaded.firstName).toBe('Novo');
  });

  it('updateAvatar returns a usable object URL and persists it', async () => {
    const blob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
    const result = await profileService.updateAvatar(blob);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.avatarUrl).toMatch(/^blob:/);
    }

    const reloaded = await profileService.getProfile();
    expect(reloaded.avatarUrl).toBe(result.success ? result.avatarUrl : null);
  });

  it('removeAvatar clears the avatar back to null', async () => {
    await profileService.updateAvatar(new Blob(['x'], { type: 'image/png' }));
    const result = await profileService.removeAvatar();

    expect(result.success).toBe(true);
    const reloaded = await profileService.getProfile();
    expect(reloaded.avatarUrl).toBeNull();
  });
});
