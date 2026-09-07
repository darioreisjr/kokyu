import type { CurrentUser } from '@/lib/api/types';

/**
 * A plausible, complete-profile `CurrentUser` — the default seeded into
 * `CurrentUserProvider` by the shared Vitest (`test/test-utils.tsx`) and
 * Storybook (`.storybook/preview.tsx`) wrappers, so any component under
 * `useCurrentUser()` renders sensibly without every single test/story
 * needing to supply one. Deliberately mirrors the same "Dario Reis"
 * placeholder identity `features/profile`'s own mocks/stories already
 * used before this feature existed, for continuity.
 */
export const mockCompleteCurrentUser: CurrentUser = {
  id: 'mock-user',
  email: 'dario@email.com',
  emailVerified: true,
  providers: ['email'],
  profile: {
    firstName: 'Dario',
    lastName: 'Reis',
    username: 'darioreis',
    birthDate: '2000-08-28',
    bio: 'Organizando cada parte da minha rotina.',
    avatarUrl: null,
    countryCode: 'BR',
    region: 'SP',
    city: 'São Paulo',
  },
  profileCompletion: {
    completed: true,
    completedAt: '2024-01-01T00:00:00.000Z',
    version: 1,
    missingFields: [],
  },
  access: {
    canUseApplication: true,
    redirectTo: null,
  },
};

/** Same identity, but as `/me` would report it mid-onboarding — used by onboarding stories/tests. */
export const mockIncompleteCurrentUser: CurrentUser = {
  ...mockCompleteCurrentUser,
  profile: {
    ...mockCompleteCurrentUser.profile,
    lastName: null,
    username: null,
    birthDate: null,
    bio: null,
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
  access: {
    canUseApplication: false,
    redirectTo: '/perfil/completar',
  },
};
