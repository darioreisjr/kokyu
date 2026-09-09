import { createClient } from '@/lib/supabase/client';
import { apiFetchClient } from '@/lib/api/client';

/** The Supabase Storage bucket the backend issues signed cover upload URLs for — matches the bucket created in supabase/migrations/20260103000000_leisure_covers_storage.sql and `LEISURE_COVERS_BUCKET` in the backend's leisure-items.repository.ts. */
const LEISURE_COVERS_BUCKET = 'leisure-covers';

interface CoverUploadUrlResponse {
  path: string;
  token: string;
  signedUrl: string;
}

/**
 * Storage rejects an upload that slips past `validateCoverImageFile`'s
 * client-side check using its own bucket-level `file_size_limit`/
 * `allowed_mime_types` config - real, server-side enforcement we don't
 * control the wording of. Mirrors `avatarUploadService.ts`'s mapping.
 */
function friendlyStorageUploadError(error: { message?: string } | null): string {
  const message = error?.message?.toLowerCase() ?? '';
  if (
    message.includes('exceed') ||
    message.includes('maximum allowed size') ||
    message.includes('too large')
  ) {
    return 'A imagem é muito grande. O tamanho máximo é 5 MB.';
  }
  if (message.includes('mime') || message.includes('content-type') || message.includes('content type')) {
    return 'Formato de imagem não suportado. Envie um arquivo JPEG, PNG ou WebP.';
  }
  return 'Não foi possível enviar a imagem. Tente novamente.';
}

/**
 * Full cover image upload flow: ask the backend for a signed upload URL
 * (`POST /leisure/items/covers/upload-url`), upload the file directly to
 * Supabase Storage with it (never through our own backend), then resolve
 * the object's public URL locally (`getPublicUrl` — the "leisure-covers"
 * bucket is public, so this is a pure computation, no network call and no
 * backend "confirm" step, unlike the avatar flow). The returned URL is
 * exactly what `coverImage` expects - the caller just sets it on the form.
 */
export async function uploadLeisureCoverImage(file: File): Promise<string> {
  const uploadTarget = await apiFetchClient<CoverUploadUrlResponse>(
    '/leisure/items/covers/upload-url',
    { method: 'POST', body: { contentType: file.type || 'image/jpeg' } },
  );

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from(LEISURE_COVERS_BUCKET)
    .uploadToSignedUrl(uploadTarget.path, uploadTarget.token, file);

  if (uploadError) {
    throw new Error(friendlyStorageUploadError(uploadError));
  }

  const { data } = supabase.storage.from(LEISURE_COVERS_BUCKET).getPublicUrl(uploadTarget.path);
  return data.publicUrl;
}
