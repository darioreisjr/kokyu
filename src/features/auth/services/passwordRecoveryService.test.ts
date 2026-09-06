import { describe, expect, it, vi } from 'vitest';

import { passwordRecoveryService } from './passwordRecoveryService';

const resetPasswordForEmail = vi.fn();
const updateUser = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: (...args: unknown[]) => resetPasswordForEmail(...args),
      updateUser: (...args: unknown[]) => updateUser(...args),
    },
  }),
}));

describe('passwordRecoveryService (Supabase provider)', () => {
  it('requests recovery through the shared PKCE callback, landing on /reset-password', async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: null });

    const result = await passwordRecoveryService.requestPasswordRecovery({
      email: 'usuario@example.com',
    });

    expect(resetPasswordForEmail).toHaveBeenCalledWith('usuario@example.com', {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      captchaToken: undefined,
    });
    expect(result).toEqual({ success: true });
  });

  it('resolves identically for an email that is not registered — Supabase never reveals that outcome', async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: null });

    const result = await passwordRecoveryService.requestPasswordRecovery({
      email: 'ninguem-tem-essa-conta@example.com',
    });

    expect(result).toEqual({ success: true });
  });

  it('surfaces a generic error for a real failure (e.g. captcha rejected, rate limited)', async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'rate limited' } });

    const result = await passwordRecoveryService.requestPasswordRecovery({
      email: 'usuario@example.com',
    });

    expect(result).toEqual({
      success: false,
      error: 'Não foi possível solicitar a recuperação agora. Tente novamente.',
    });
  });

  it('updates the password using the active (recovery) session', async () => {
    updateUser.mockResolvedValueOnce({ error: null });

    const result = await passwordRecoveryService.updatePassword('Abcdefgh123!');

    expect(updateUser).toHaveBeenCalledWith({ password: 'Abcdefgh123!' });
    expect(result).toEqual({ success: true });
  });

  it('surfaces a generic error when the password update fails', async () => {
    updateUser.mockResolvedValueOnce({ error: { message: 'session expired' } });

    const result = await passwordRecoveryService.updatePassword('Abcdefgh123!');

    expect(result).toEqual({
      success: false,
      error: 'Não foi possível redefinir sua senha. Tente novamente.',
    });
  });
});
