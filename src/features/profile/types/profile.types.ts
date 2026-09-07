import type { ProfileUpdatePayload } from '@/lib/api/types';

/** What the page displays — includes account-level, non-editable fields (`email`, `id`). */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  birthDate: Date;
  country: string;
  region: string;
  city: string;
  avatarUrl: string | null;
  email: string;
}

/** What the form collects — a strict subset of `UserProfile`: no `id`, `email` or `avatarUrl` (avatar is its own upload flow). */
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  birthDate: Date;
  country: string;
  region: string;
  city: string;
}

export type UpdateProfileResult =
  { success: true; profile: UserProfile } | { success: false; error: string };

export type UpdateAvatarResult =
  { success: true; avatarUrl: string } | { success: false; error: string };

export type RemoveAvatarResult = { success: true } | { success: false; error: string };

/**
 * Contract the real profile screen depends on instead of the kokyu-sam
 * backend directly (`services/profileService.ts`) — same pattern as
 * `AuthService`. Avatar upload/removal are their own methods (not
 * folded into `updateProfile`) because they're a separate direct-to-
 * Supabase-Storage upload flow — see `services/avatarUploadService.ts`.
 *
 * `updateProfile`'s payload is `ProfileUpdatePayload` from `@/lib/api/
 * types` (the backend's own `PATCH /profile` body shape,
 * `countryCode`/optional fields included) — not a locally-declared
 * type — so this contract can never drift from what `/me` actually
 * accepts.
 */
export interface ProfileService {
  getProfile: () => Promise<UserProfile>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<UpdateProfileResult>;
  updateAvatar: (file: Blob) => Promise<UpdateAvatarResult>;
  removeAvatar: () => Promise<RemoveAvatarResult>;
}
