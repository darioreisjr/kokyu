/** Centralized, non-visual configuration for leisure item cover images. */
export const leisureCoverConfig = {
  /** Matches the `accept` attribute on the file input — anything else is rejected client-side. */
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  /** 5 MB — mirrors the backend's `leisure-covers` bucket `file_size_limit`. Never repeat `5 * 1024 * 1024` elsewhere. */
  maxFileSizeBytes: 5 * 1024 * 1024,
} as const;
