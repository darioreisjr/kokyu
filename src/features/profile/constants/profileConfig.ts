/** Centralized, non-visual configuration for the profile feature. */
export const profileConfig = {
  avatar: {
    /** Matches the `accept` attribute on the file input — SVG/GIF/PDF/etc. are rejected. */
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    /** 5 MB — the single source for this limit; never repeat `5 * 1024 * 1024` elsewhere. */
    maxFileSizeBytes: 5 * 1024 * 1024,
    /** Below this on either axis, the source image is flagged as low quality (not blocked). */
    recommendedMinDimension: 256,
  },
  bio: {
    maxLength: 160,
  },
} as const;
