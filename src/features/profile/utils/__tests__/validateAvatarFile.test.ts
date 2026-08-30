import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { profileConfig } from '../../constants/profileConfig';
import { validateAvatarFile } from '../validateAvatarFile';

/**
 * jsdom doesn't actually decode images (`resources` isn't enabled), so
 * a real `Image` never fires `load`/`error` and the dimension check
 * would hang forever. Stubbing the constructor keeps this test fast
 * and deterministic without touching production code.
 */
class MockImage {
  onload: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  naturalWidth = 512;
  naturalHeight = 512;

  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

beforeEach(() => {
  vi.stubGlobal('Image', MockImage);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('validateAvatarFile', () => {
  it('rejects a disallowed MIME type (e.g. SVG)', async () => {
    const file = makeFile('avatar.svg', 'image/svg+xml', 1000);
    const result = await validateAvatarFile(file);
    expect(result).toEqual({ valid: false, error: 'Selecione uma imagem JPEG, PNG ou WebP.' });
  });

  it('rejects a GIF', async () => {
    const file = makeFile('avatar.gif', 'image/gif', 1000);
    const result = await validateAvatarFile(file);
    expect(result.valid).toBe(false);
  });

  it('rejects a file larger than the configured limit', async () => {
    const file = makeFile('avatar.jpg', 'image/jpeg', profileConfig.avatar.maxFileSizeBytes + 1);
    const result = await validateAvatarFile(file);
    expect(result).toEqual({ valid: false, error: 'A imagem deve ter no máximo 5 MB.' });
  });

  it('accepts a valid JPEG within the size limit', async () => {
    const file = makeFile('avatar.jpg', 'image/jpeg', 1000);
    const result = await validateAvatarFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts PNG and WebP too', async () => {
    await expect(validateAvatarFile(makeFile('a.png', 'image/png', 1000))).resolves.toMatchObject({
      valid: true,
    });
    await expect(validateAvatarFile(makeFile('a.webp', 'image/webp', 1000))).resolves.toMatchObject(
      { valid: true },
    );
  });

  it('warns (without blocking) when the image is smaller than recommended', async () => {
    class SmallMockImage extends MockImage {
      naturalWidth = 100;
      naturalHeight = 100;
    }
    vi.stubGlobal('Image', SmallMockImage);

    const result = await validateAvatarFile(makeFile('small.png', 'image/png', 1000));

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.warning).toContain('256x256');
    }
  });

  it('does not warn for an image meeting the recommended dimensions', async () => {
    const result = await validateAvatarFile(makeFile('big.png', 'image/png', 1000));
    expect(result).toEqual({ valid: true });
  });
});
