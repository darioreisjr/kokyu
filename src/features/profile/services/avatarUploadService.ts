import { createClient } from '@/lib/supabase/client';
import { apiFetchClient, type ClientRequestInit } from '@/lib/api/client';
import type { AvatarUploadUrlResponse, CurrentUser } from '@/lib/api/types';

/** The Supabase Storage bucket the backend issues signed avatar upload URLs for — matches `AVATARS_BUCKET` in the backend's `profiles.repository.ts`. */
const AVATAR_BUCKET = 'avatars';

export interface AvatarMutationOptions {
  /** Forwarded to `apiFetchClient` — set by onboarding's own avatar step so a `PROFILE_SETUP_REQUIRED` response (shouldn't happen mid-completion, but just in case) never redirects the page to itself. */
  suppressProfileSetupRedirect?: boolean;
}

/**
 * Storage rejects an upload that slips past `validateAvatarFile`'s
 * client-side check (a spoofed `file.type`, devtools tampering, a
 * direct API call) using its own bucket-level `file_size_limit`/
 * `allowed_mime_types` config (see the backend's
 * `20260101000004_avatars_storage.sql`) — real, server-side enforcement
 * we don't control the wording of. `storage-js` surfaces that as a
 * generic `StorageApiError` with a message, not one of our own
 * `ErrorCode`s, so this maps the common cases back to the same
 * `AVATAR_TOO_LARGE`/`AVATAR_INVALID`-flavored copy the rest of the app
 * uses, falling back to a generic retry message for anything else
 * (network failure, an expired signed URL, ...).
 */
function friendlyStorageUploadError(error: { message?: string } | null): string {
  const message = error?.message?.toLowerCase() ?? '';
  if (message.includes('exceed') || message.includes('maximum allowed size') || message.includes('too large')) {
    return 'A imagem é muito grande. O tamanho máximo é 5 MB.';
  }
  if (message.includes('mime') || message.includes('content-type') || message.includes('content type')) {
    return 'Formato de imagem não suportado. Envie um arquivo JPEG, PNG ou WebP.';
  }
  return 'Não foi possível enviar a imagem. Tente novamente.';
}

/**
 * Full avatar upload flow, in the order the spec describes: ask the
 * backend for a signed upload URL/token (`POST /profile/avatar/upload-
 * url`), upload the cropped image directly to Supabase Storage with it
 * (never through our own backend — that's the point of a signed direct
 * upload), then confirm the resulting object path with the backend
 * (`PATCH /profile/avatar`), which persists it and returns the updated
 * `CurrentUser`.
 *
 * Confirmed against the real backend (built in parallel): `POST
 * /profile/avatar/upload-url` returns `{path, token, signedUrl}`,
 * consumed here via `@supabase/storage-js`'s `uploadToSignedUrl(path,
 * token, file)` — matches `AvatarUploadUrlResponseDto` exactly.
 */
export async function uploadAvatar(
  blob: Blob,
  options: AvatarMutationOptions = {},
): Promise<CurrentUser> {
  const requestInit: ClientRequestInit = {
    method: 'POST',
    body: { contentType: blob.type || 'image/jpeg' },
    suppressProfileSetupRedirect: options.suppressProfileSetupRedirect,
  };

  const uploadTarget = await apiFetchClient<AvatarUploadUrlResponse>(
    '/profile/avatar/upload-url',
    requestInit,
  );

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .uploadToSignedUrl(uploadTarget.path, uploadTarget.token, blob);

  if (uploadError) {
    throw new Error(friendlyStorageUploadError(uploadError));
  }

  return apiFetchClient<CurrentUser>('/profile/avatar', {
    method: 'PATCH',
    body: { path: uploadTarget.path },
    suppressProfileSetupRedirect: options.suppressProfileSetupRedirect,
  });
}

export async function removeAvatarUpload(options: AvatarMutationOptions = {}): Promise<CurrentUser> {
  return apiFetchClient<CurrentUser>('/profile/avatar', {
    method: 'DELETE',
    suppressProfileSetupRedirect: options.suppressProfileSetupRedirect,
  });
}
