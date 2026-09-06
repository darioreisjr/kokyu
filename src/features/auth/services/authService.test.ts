import { describe, expect, it, vi } from 'vitest';

import { authService } from './authService';

const signInWithPassword = vi.fn();
const signInWithOAuth = vi.fn();
const signOut = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
      signInWithOAuth: (...args: unknown[]) => signInWithOAuth(...args),
      signOut: (...args: unknown[]) => signOut(...args),
    },
  }),
}));

describe('authService (Supabase provider)', () => {
  it('signs in with email/password and maps the resulting Supabase user', async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'user@example.com' } },
      error: null,
    });

    const result = await authService.signInWithCredentials({
      email: 'user@example.com',
      password: 'Abcdefgh123!',
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Abcdefgh123!',
      options: undefined,
    });
    expect(result).toEqual({
      success: true,
      user: { id: 'user-1', email: 'user@example.com' },
    });
  });

  it('forwards a captcha token when one is provided', async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'user@example.com' } },
      error: null,
    });

    await authService.signInWithCredentials(
      { email: 'user@example.com', password: 'Abcdefgh123!' },
      'captcha-token',
    );

    expect(signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({ options: { captchaToken: 'captcha-token' } }),
    );
  });

  it('never reveals whether the email exists — invalid credentials map to a generic message', async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    });

    const result = await authService.signInWithCredentials({
      email: 'user@example.com',
      password: 'wrong',
    });

    expect(result).toEqual({ success: false, error: 'E-mail ou senha inválidos.' });
  });

  it('reports the specific "email not confirmed" state by Supabase error code only', async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { code: 'email_not_confirmed', message: 'Email not confirmed' },
    });

    const result = await authService.signInWithCredentials({
      email: 'user@example.com',
      password: 'Abcdefgh123!',
    });

    expect(result).toEqual({
      success: false,
      error: 'Confirme seu e-mail antes de continuar.',
    });
  });

  it('starts Google OAuth with the minimal scopes and the app callback as redirectTo', async () => {
    signInWithOAuth.mockResolvedValueOnce({ data: {}, error: null });

    // Google sign-in never resolves on success (the browser navigates
    // away) — only assert the call, not the returned promise.
    void authService.signInWithGoogle();
    await Promise.resolve();

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid email profile',
      },
    });
  });

  it('resolves Google sign-in with a generic error when Supabase rejects the request', async () => {
    signInWithOAuth.mockResolvedValueOnce({ data: {}, error: { message: 'boom' } });

    const result = await authService.signInWithGoogle();

    expect(result).toEqual({ success: false, error: 'Não foi possível entrar. Tente novamente.' });
  });

  it('signs out through Supabase', async () => {
    signOut.mockResolvedValueOnce({ error: null });

    await authService.signOut();

    expect(signOut).toHaveBeenCalled();
  });
});
