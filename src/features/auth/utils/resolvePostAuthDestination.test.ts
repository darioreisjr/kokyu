import { describe, expect, it, vi } from 'vitest';

import type { CurrentUser } from '@/lib/api/types';

const mockGetCurrentUserClient = vi.fn();

vi.mock('@/lib/api/client', () => ({
  getCurrentUserClient: () => mockGetCurrentUserClient(),
}));

const {
  ONBOARDING_PATH,
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  resolveDestinationForCurrentUser,
  resolvePostAuthDestinationClient,
} = await import('./resolvePostAuthDestination');

const completeUser: CurrentUser = {
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

const incompleteUser: CurrentUser = {
  ...completeUser,
  profileCompletion: {
    completed: false,
    completedAt: null,
    version: 1,
    missingFields: ['username'],
  },
  access: { canUseApplication: false, redirectTo: ONBOARDING_PATH },
};

describe('resolveDestinationForCurrentUser', () => {
  it('sends an incomplete profile to /perfil/completar regardless of the fallback', () => {
    expect(resolveDestinationForCurrentUser(incompleteUser, '/app/habitos')).toBe(ONBOARDING_PATH);
  });

  it('sends a complete profile to the given fallback', () => {
    expect(resolveDestinationForCurrentUser(completeUser, '/app/habitos')).toBe('/app/habitos');
  });

  it('defaults the fallback to /app when none is given', () => {
    expect(resolveDestinationForCurrentUser(completeUser)).toBe(DEFAULT_AUTHENTICATED_PATH);
  });
});

describe('resolvePostAuthDestinationClient', () => {
  it('resolves to /perfil/completar for an incomplete profile, ignoring the preference-based fallback', async () => {
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'authenticated', currentUser: incompleteUser });
    await expect(resolvePostAuthDestinationClient('/app/habitos')).resolves.toBe(ONBOARDING_PATH);
  });

  it('resolves to the preference-based destination for a complete profile', async () => {
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'authenticated', currentUser: completeUser });
    await expect(resolvePostAuthDestinationClient('/app/habitos')).resolves.toBe('/app/habitos');
  });

  it('resolves to /login when there is no session', async () => {
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'unauthenticated' });
    await expect(resolvePostAuthDestinationClient('/app/habitos')).resolves.toBe(LOGIN_PATH);
  });

  it('resolves to /login on a backend error rather than guessing /app', async () => {
    mockGetCurrentUserClient.mockResolvedValueOnce({ status: 'error', error: new Error('boom') });
    await expect(resolvePostAuthDestinationClient('/app/habitos')).resolves.toBe(LOGIN_PATH);
  });
});
