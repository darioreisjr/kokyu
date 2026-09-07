import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CurrentUser } from '@/lib/api/types';

const { mockApiFetchClient, mockGetCurrentUserClient } = vi.hoisted(() => ({
  mockApiFetchClient: vi.fn(),
  mockGetCurrentUserClient: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  apiFetchClient: mockApiFetchClient,
  getCurrentUserClient: mockGetCurrentUserClient,
}));

const { CurrentUserProvider, useCurrentUser } = await import('./CurrentUserProvider');

const baseUser: CurrentUser = {
  id: 'user-1',
  email: 'dario@email.com',
  emailVerified: true,
  providers: ['email'],
  profile: {
    firstName: 'Dario',
    lastName: 'Reis',
    username: 'darioreis',
    birthDate: '2000-08-28',
    bio: null,
    avatarUrl: null,
    countryCode: 'BR',
    region: null,
    city: null,
  },
  profileCompletion: { completed: true, completedAt: '2024-01-01', version: 1, missingFields: [] },
  access: { canUseApplication: true, redirectTo: null },
};

function renderCurrentUser(initialCurrentUser: CurrentUser | null) {
  return renderHook(() => useCurrentUser(), {
    wrapper: ({ children }) => (
      <CurrentUserProvider initialCurrentUser={initialCurrentUser}>{children}</CurrentUserProvider>
    ),
  });
}

describe('CurrentUserProvider', () => {
  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useCurrentUser())).toThrow(
      'useCurrentUser must be used within a CurrentUserProvider',
    );
  });

  it('exposes the server-provided initial user with no extra fetch', () => {
    const { result } = renderCurrentUser(baseUser);

    expect(result.current.currentUser).toEqual(baseUser);
    expect(result.current.profile).toEqual(baseUser.profile);
    expect(result.current.isProfileComplete).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(mockGetCurrentUserClient).not.toHaveBeenCalled();
  });

  it('derives isProfileComplete as false when there is no user yet', () => {
    const { result } = renderCurrentUser(null);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isProfileComplete).toBe(false);
    expect(result.current.profileCompletion).toBeNull();
  });

  it('refreshCurrentUser re-fetches /me and replaces the user', async () => {
    const refreshed = { ...baseUser, profile: { ...baseUser.profile, firstName: 'Novo' } };
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'authenticated', currentUser: refreshed });

    const { result } = renderCurrentUser(baseUser);
    await act(async () => {
      await result.current.refreshCurrentUser();
    });

    expect(result.current.currentUser?.profile.firstName).toBe('Novo');
    expect(result.current.isLoading).toBe(false);
  });

  it('refreshCurrentUser clears the user when the session is gone', async () => {
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'unauthenticated' });

    const { result } = renderCurrentUser(baseUser);
    await act(async () => {
      await result.current.refreshCurrentUser();
    });

    expect(result.current.currentUser).toBeNull();
  });

  it('refreshCurrentUser records an error without touching currentUser, on a non-auth failure', async () => {
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'error', error: new Error('boom') });

    const { result } = renderCurrentUser(baseUser);
    await act(async () => {
      await result.current.refreshCurrentUser();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.currentUser).toEqual(baseUser);
  });

  it('updateProfile PATCHes /profile and replaces currentUser with the response', async () => {
    const updated = { ...baseUser, profile: { ...baseUser.profile, bio: 'Nova bio' } };
    mockApiFetchClient.mockResolvedValueOnce(updated);

    const { result } = renderCurrentUser(baseUser);
    let returned!: CurrentUser;
    await act(async () => {
      returned = await result.current.updateProfile({ bio: 'Nova bio' });
    });

    expect(mockApiFetchClient).toHaveBeenCalledWith('/profile', {
      method: 'PATCH',
      body: { bio: 'Nova bio' },
    });
    expect(returned.profile.bio).toBe('Nova bio');
    expect(result.current.currentUser?.profile.bio).toBe('Nova bio');
  });

  it('completeProfile POSTs /profile/complete, suppressing the redirect, and replaces currentUser', async () => {
    const completed = {
      ...baseUser,
      profileCompletion: { completed: true, completedAt: '2024-02-01', version: 1, missingFields: [] },
    };
    mockApiFetchClient.mockResolvedValueOnce(completed);

    const { result } = renderCurrentUser(null);
    await act(async () => {
      await result.current.completeProfile({
        firstName: 'Dario',
        lastName: 'Reis',
        username: 'darioreis',
        birthDate: '2000-08-28',
      });
    });

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/profile/complete',
      expect.objectContaining({ method: 'POST', suppressProfileSetupRedirect: true }),
    );
    expect(result.current.isProfileComplete).toBe(true);
  });

  it('clearCurrentUser resets the user and error to null (logout)', async () => {
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'error', error: new Error('boom') });
    const { result } = renderCurrentUser(baseUser);
    await act(async () => {
      await result.current.refreshCurrentUser();
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearCurrentUser();
    });

    expect(result.current.currentUser).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
