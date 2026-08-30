import { format } from 'date-fns';

import type {
  ProfileService,
  RemoveAvatarResult,
  UpdateAvatarResult,
  UpdateProfilePayload,
  UpdateProfileResult,
  UserProfile,
} from '../types/profile.types';

/**
 * In-memory mock "current user" — there's no real session anywhere in
 * the app yet (mocked auth never persists one), so this is a single
 * plausible profile rather than something looked up by id, same
 * spirit as `createAccountService`'s other mocked responses.
 */
let mockProfile: UserProfile = {
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

/**
 * Mocked implementation used while there is no backend — same pattern
 * as `authService`/`createAccountService`. `updateAvatar` mints an
 * object URL to stand in for "the permanent URL a real upload would
 * return"; callers own revoking it when it's superseded, same as any
 * other object URL in this feature (see `useProfileForm`).
 */
const mockProfileService: ProfileService = {
  async getProfile(): Promise<UserProfile> {
    return { ...mockProfile };
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResult> {
    mockProfile = {
      ...mockProfile,
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      bio: payload.bio,
      birthDate: new Date(`${payload.birthDate}T00:00:00`),
      country: payload.country,
      region: payload.region,
      city: payload.city,
    };
    return { success: true, profile: { ...mockProfile } };
  },

  async updateAvatar(file: Blob): Promise<UpdateAvatarResult> {
    const avatarUrl = URL.createObjectURL(file);
    mockProfile = { ...mockProfile, avatarUrl };
    return { success: true, avatarUrl };
  },

  async removeAvatar(): Promise<RemoveAvatarResult> {
    mockProfile = { ...mockProfile, avatarUrl: null };
    return { success: true };
  },
};

export const profileService: ProfileService = mockProfileService;

/**
 * Narrows `ProfileFormData` (client-only shape) into what a future API
 * would accept — same role as `mapFormDataToPayload` in
 * `createAccountService`. Formatted in local time (`date-fns`), not
 * `toISOString()`, for the same reason: UTC conversion can shift the
 * calendar date by a day for timezones ahead of UTC.
 */
export function mapFormDataToPayload(formData: {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  birthDate: Date;
  country: string;
  region: string;
  city: string;
}): UpdateProfilePayload {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    username: formData.username,
    bio: formData.bio,
    birthDate: format(formData.birthDate, 'yyyy-MM-dd'),
    country: formData.country,
    region: formData.region,
    city: formData.city,
  };
}
