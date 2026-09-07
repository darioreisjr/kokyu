/**
 * Shared types for the kokyu-sam backend contract (`GET /api/v1/me` and
 * friends). Single source of truth — `features/current-user`,
 * `features/profile` and `features/onboarding` all import from here
 * instead of each declaring their own copy. Field names/nullability
 * mirror the backend response exactly (camelCase, explicit `null` for
 * "not set" rather than `undefined`, `birthDate` as a plain `YYYY-MM-DD`
 * string — never a `Date`, so there's nothing to get wrong hydrating a
 * server-rendered value on the client).
 */

/** Identity providers linked to the account. Loose on purpose — the backend may add providers this frontend doesn't special-case yet. */
export type AuthProviderId = 'email' | 'google' | (string & {});

export interface Profile {
  firstName: string;
  lastName: string | null;
  username: string | null;
  birthDate: string | null;
  bio: string | null;
  avatarUrl: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
}

export interface ProfileCompletion {
  completed: boolean;
  completedAt: string | null;
  version: number;
  missingFields: string[];
}

export interface CurrentUserAccess {
  canUseApplication: boolean;
  redirectTo: string | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  emailVerified: boolean;
  providers: AuthProviderId[];
  profile: Profile;
  profileCompletion: ProfileCompletion;
  access: CurrentUserAccess;
}

/** Body for `POST /profile/complete` — every required field, plus the optional ones. */
export interface ProfileCompletePayload {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  bio?: string;
  countryCode?: string;
  region?: string;
  city?: string;
}

/** Body for `PATCH /profile` — same fields, all optional. */
export type ProfileUpdatePayload = Partial<ProfileCompletePayload>;

export interface UsernameAvailabilityResponse {
  username: string;
  available: boolean;
}

/**
 * Assumed shape of `POST /profile/avatar/upload-url`'s response — the
 * backend is being built in parallel and this endpoint's exact payload
 * wasn't observable while implementing this. Modeled after Supabase
 * Storage's own `createSignedUploadUrl` response (`{path, token,
 * signedUrl}`, see `@supabase/storage-js`'s `uploadToSignedUrl`), since
 * the spec says the backend issues a signed upload URL/token for direct
 * upload. If the real backend returns a different shape, only
 * `features/profile/services/avatarUploadService.ts` needs to change —
 * every caller goes through that one function.
 */
export interface AvatarUploadUrlResponse {
  path: string;
  token: string;
  signedUrl: string;
}

/** Body for `PATCH /profile/avatar` — registers the uploaded object's path with the backend. */
export interface ConfirmAvatarPayload {
  path: string;
}
