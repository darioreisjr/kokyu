import { describe, expect, it } from 'vitest';

import { authService } from './authService';

describe('authService (mock provider)', () => {
  it('resolves credential sign-in as successful with the given email', async () => {
    const result = await authService.signInWithCredentials({
      email: 'user@example.com',
      password: 'anything',
    });

    expect(result).toEqual({
      success: true,
      user: { id: 'mock-user', email: 'user@example.com' },
    });
  });

  it('resolves Google sign-in as successful', async () => {
    const result = await authService.signInWithGoogle();

    expect(result.success).toBe(true);
  });

  it('resolves sign-out without throwing', async () => {
    await expect(authService.signOut()).resolves.toBeUndefined();
  });
});
