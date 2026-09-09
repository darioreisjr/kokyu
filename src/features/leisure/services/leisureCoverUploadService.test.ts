import { describe, expect, it, vi } from 'vitest';

const { mockApiFetchClient, mockUploadToSignedUrl, mockGetPublicUrl } = vi.hoisted(() => ({
  mockApiFetchClient: vi.fn(),
  mockUploadToSignedUrl: vi.fn(),
  mockGetPublicUrl: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({ apiFetchClient: mockApiFetchClient }));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        uploadToSignedUrl: mockUploadToSignedUrl,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}));

const { uploadLeisureCoverImage } = await import('./leisureCoverUploadService');

function buildFile(type = 'image/png'): File {
  return new File([new Uint8Array(4)], 'cover.png', { type });
}

describe('uploadLeisureCoverImage', () => {
  it('asks for a signed upload URL, uploads to it, and resolves the public URL', async () => {
    mockApiFetchClient.mockResolvedValueOnce({
      path: 'user-1/abc.png',
      token: 'tok',
      signedUrl: 'https://storage.test/upload',
    });
    mockUploadToSignedUrl.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: { publicUrl: 'https://storage.test/public/leisure-covers/user-1/abc.png' },
    });

    const url = await uploadLeisureCoverImage(buildFile());

    expect(mockApiFetchClient).toHaveBeenCalledWith('/leisure/items/covers/upload-url', {
      method: 'POST',
      body: { contentType: 'image/png' },
    });
    expect(mockUploadToSignedUrl).toHaveBeenCalledWith('user-1/abc.png', 'tok', expect.any(File));
    expect(url).toBe('https://storage.test/public/leisure-covers/user-1/abc.png');
  });

  it('throws a friendly error when the file is too large', async () => {
    mockApiFetchClient.mockResolvedValueOnce({
      path: 'user-1/abc.png',
      token: 'tok',
      signedUrl: 'https://storage.test/upload',
    });
    mockUploadToSignedUrl.mockResolvedValueOnce({
      error: { message: 'The object exceeds the maximum allowed size' },
    });

    await expect(uploadLeisureCoverImage(buildFile())).rejects.toThrow('máximo é 5 MB');
  });

  it('throws a friendly error for an unsupported content type rejected by Storage', async () => {
    mockApiFetchClient.mockResolvedValueOnce({
      path: 'user-1/abc.png',
      token: 'tok',
      signedUrl: 'https://storage.test/upload',
    });
    mockUploadToSignedUrl.mockResolvedValueOnce({
      error: { message: 'invalid mime type' },
    });

    await expect(uploadLeisureCoverImage(buildFile())).rejects.toThrow('não suportado');
  });
});
