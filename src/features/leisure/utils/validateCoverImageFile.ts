import { leisureCoverConfig } from '../constants/leisureCoverConfig';

export type CoverImageFileValidation = { valid: true } | { valid: false; error: string };

const ALLOWED_MIME_TYPES: readonly string[] = leisureCoverConfig.allowedMimeTypes;
const MAX_FILE_SIZE_MB = leisureCoverConfig.maxFileSizeBytes / (1024 * 1024);

/**
 * Client-side gate before a file ever reaches the upload flow — a UX
 * convenience only, not a substitute for the backend's own bucket-level
 * `file_size_limit`/`allowed_mime_types` enforcement (see
 * supabase/migrations/20260103000000_leisure_covers_storage.sql).
 */
export function validateCoverImageFile(file: File): CoverImageFileValidation {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Selecione uma imagem JPEG, PNG ou WebP.' };
  }

  if (file.size > leisureCoverConfig.maxFileSizeBytes) {
    return { valid: false, error: `A imagem deve ter no máximo ${MAX_FILE_SIZE_MB} MB.` };
  }

  return { valid: true };
}
