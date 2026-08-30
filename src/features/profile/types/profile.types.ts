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

/**
 * What a future API would accept. Deliberately excludes `age` — it's
 * always derived from `birthDate` (`calculateAge`), never stored or
 * sent on its own.
 */
export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  birthDate: string;
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
 * Contract for a future real profile API. Mocked for now
 * (`services/profileService.ts`) — same pattern as `AuthService`.
 * Avatar upload/removal are their own methods (not folded into
 * `updateProfile`) because they're a separate upload flow, per the
 * future `PATCH profile` + separate avatar upload split.
 */
export interface ProfileService {
  getProfile: () => Promise<UserProfile>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UpdateProfileResult>;
  updateAvatar: (file: Blob) => Promise<UpdateAvatarResult>;
  removeAvatar: () => Promise<RemoveAvatarResult>;
}
