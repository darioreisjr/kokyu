import { profileConfig } from '../constants/profileConfig';

export type AvatarFileValidation =
  { valid: true; warning?: string } | { valid: false; error: string };

const ALLOWED_MIME_TYPES: readonly string[] = profileConfig.avatar.allowedMimeTypes;
const MAX_FILE_SIZE_MB = profileConfig.avatar.maxFileSizeBytes / (1024 * 1024);

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    image.src = url;
  });
}

/**
 * Client-side gate before a file ever reaches the cropper: extension
 * (via MIME), size, and a soft dimension check. This is a UX
 * convenience only — it does not substitute for backend validation.
 * A future real upload endpoint must still independently: verify the
 * actual MIME type from the file's signature (not the browser-reported
 * `file.type`, which is trivially spoofable), enforce the size limit
 * server-side, generate its own internal filename (never trust the
 * original), re-encode/reprocess the image, and store it securely.
 */
export async function validateAvatarFile(file: File): Promise<AvatarFileValidation> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Selecione uma imagem JPEG, PNG ou WebP.' };
  }

  if (file.size > profileConfig.avatar.maxFileSizeBytes) {
    return { valid: false, error: `A imagem deve ter no máximo ${MAX_FILE_SIZE_MB} MB.` };
  }

  const dimensions = await readImageDimensions(file).catch(() => null);
  const minDimension = profileConfig.avatar.recommendedMinDimension;
  if (dimensions && (dimensions.width < minDimension || dimensions.height < minDimension)) {
    return {
      valid: true,
      warning: `Para melhor qualidade, use uma imagem de pelo menos ${minDimension}x${minDimension}px.`,
    };
  }

  return { valid: true };
}
