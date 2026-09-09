import { describe, expect, it } from 'vitest';

import { leisureCoverConfig } from '../constants/leisureCoverConfig';
import { validateCoverImageFile } from './validateCoverImageFile';

function buildFile(overrides: { type?: string; size?: number } = {}): File {
  const size = overrides.size ?? 1024;
  const file = new File([new Uint8Array(size)], 'cover.png', {
    type: overrides.type ?? 'image/png',
  });
  return file;
}

describe('validateCoverImageFile', () => {
  it('accepts a small JPEG/PNG/WebP file', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateCoverImageFile(buildFile({ type })).valid).toBe(true);
    }
  });

  it('rejects an unsupported mime type', () => {
    const result = validateCoverImageFile(buildFile({ type: 'application/pdf' }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('JPEG, PNG ou WebP');
  });

  it('rejects a file larger than the configured limit', () => {
    const result = validateCoverImageFile(
      buildFile({ size: leisureCoverConfig.maxFileSizeBytes + 1 }),
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('5 MB');
  });
});
