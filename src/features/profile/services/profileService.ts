import { format } from 'date-fns';

import { apiFetchClient } from '@/lib/api/client';
import { friendlyErrorMessage } from '@/lib/api/errors';
import type { CurrentUser, ProfileUpdatePayload } from '@/lib/api/types';

import { DEFAULT_COUNTRY_CODE } from '../constants/countries';
import type {
  ProfileFormData,
  ProfileService,
  RemoveAvatarResult,
  UpdateAvatarResult,
  UpdateProfileResult,
  UserProfile,
} from '../types/profile.types';
import { removeAvatarUpload, uploadAvatar } from './avatarUploadService';

const GENERIC_SAVE_ERROR = 'Não foi possível atualizar seu perfil. Tente novamente.';
const GENERIC_LOAD_ERROR = 'Não foi possível carregar seu perfil agora.';

/**
 * Maps the backend's `CurrentUser` (nullable optional fields,
 * `countryCode`, ISO `birthDate` string) into `UserProfile` — the
 * shape every existing profile component was already built against.
 * `/app/perfil` is only reachable once `profileCompletion.completed`
 * is `true` (see `app/app/layout.tsx`), so `firstName`/`lastName`/
 * `username`/`birthDate` are guaranteed non-null here by that gate —
 * the fallbacks below exist only as a last-resort safety net, never as
 * an expected path.
 */
export function mapCurrentUserToProfile(currentUser: CurrentUser): UserProfile {
  const { profile } = currentUser;
  return {
    id: currentUser.id,
    firstName: profile.firstName,
    lastName: profile.lastName ?? '',
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    birthDate: profile.birthDate ? new Date(`${profile.birthDate}T00:00:00`) : new Date(),
    country: profile.countryCode ?? DEFAULT_COUNTRY_CODE,
    region: profile.region ?? '',
    city: profile.city ?? '',
    avatarUrl: profile.avatarUrl,
    email: currentUser.email,
  };
}

/**
 * Narrows `ProfileFormData`/`ProfileFormValues` (client-only shape,
 * `country`) into the backend's `PATCH /profile` body
 * (`ProfileUpdatePayload`, `countryCode`) — the one place that renames
 * the field, so every component keeps using `country` (its existing,
 * already-wired-up field name) without needing to change. Formatted
 * with `date-fns` in local time, not `toISOString()`, for the same
 * reason `createAccountService`'s mapper is: UTC conversion can shift
 * the calendar date by a day for timezones ahead of UTC.
 */
export function mapFormDataToPayload(formData: ProfileFormData): ProfileUpdatePayload {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    username: formData.username,
    bio: formData.bio,
    birthDate: format(formData.birthDate, 'yyyy-MM-dd'),
    countryCode: formData.country,
    region: formData.region,
    city: formData.city,
  };
}

/**
 * Real kokyu-sam backend implementation — `ProfileForm`/`useProfileForm`
 * only depend on the `ProfileService` contract, so nothing above this
 * file changes if the backend's shape shifts (only this file, and
 * `avatarUploadService.ts`, would).
 */
const backedProfileService: ProfileService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const currentUser = await apiFetchClient<CurrentUser>('/me');
      return mapCurrentUserToProfile(currentUser);
    } catch {
      throw new Error(GENERIC_LOAD_ERROR);
    }
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<UpdateProfileResult> {
    try {
      const currentUser = await apiFetchClient<CurrentUser>('/profile', {
        method: 'PATCH',
        body: payload,
      });
      return { success: true, profile: mapCurrentUserToProfile(currentUser) };
    } catch (error) {
      return { success: false, error: friendlyErrorMessage(error, GENERIC_SAVE_ERROR) };
    }
  },

  async updateAvatar(file: Blob): Promise<UpdateAvatarResult> {
    try {
      const currentUser = await uploadAvatar(file);
      const avatarUrl = currentUser.profile.avatarUrl;
      if (!avatarUrl) {
        return { success: false, error: GENERIC_SAVE_ERROR };
      }
      return { success: true, avatarUrl };
    } catch (error) {
      return { success: false, error: friendlyErrorMessage(error, GENERIC_SAVE_ERROR) };
    }
  },

  async removeAvatar(): Promise<RemoveAvatarResult> {
    try {
      await removeAvatarUpload();
      return { success: true };
    } catch (error) {
      return { success: false, error: friendlyErrorMessage(error, GENERIC_SAVE_ERROR) };
    }
  },
};

export const profileService: ProfileService = backedProfileService;
