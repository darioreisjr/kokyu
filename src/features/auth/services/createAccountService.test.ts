import { describe, expect, it, vi } from 'vitest';

import { createAccountService, mapFormDataToPayload } from './createAccountService';

describe('mapFormDataToPayload', () => {
  it('narrows form data into a payload, formatting the birth date and dropping confirmPassword', () => {
    const payload = mapFormDataToPayload({
      email: 'dario@example.com',
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'dario_reis',
      birthDate: new Date(2000, 7, 28),
      password: 'Abcdefgh123!',
      confirmPassword: 'Abcdefgh123!',
    });

    expect(payload).toEqual({
      email: 'dario@example.com',
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'dario_reis',
      birthDate: '2000-08-28',
      password: 'Abcdefgh123!',
    });
    expect(payload).not.toHaveProperty('confirmPassword');
  });
});

const signUp = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: (...args: unknown[]) => signUp(...args),
    },
  }),
}));

const VALID_PAYLOAD = {
  email: 'dario@example.com',
  firstName: 'Dario',
  lastName: 'Reis',
  username: 'dario_reis',
  birthDate: '2000-08-28',
  password: 'Abcdefgh123!',
};

describe('createAccountService (Supabase provider)', () => {
  it('always reports usernames as available — no backend endpoint exists to check them yet', async () => {
    const result = await createAccountService.checkUsernameAvailability('anything-at-all');
    expect(result).toEqual({ available: true });
  });

  it('signs up with Supabase, mapping profile fields into user_metadata', async () => {
    signUp.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });

    const result = await createAccountService.createAccount(VALID_PAYLOAD);

    expect(signUp).toHaveBeenCalledWith({
      email: 'dario@example.com',
      password: 'Abcdefgh123!',
      options: {
        captchaToken: undefined,
        data: {
          first_name: 'Dario',
          last_name: 'Reis',
          username: 'dario_reis',
          birth_date: '2000-08-28',
        },
      },
    });
    expect(result).toEqual({
      success: true,
      user: { id: 'user-1', firstName: 'Dario', lastName: 'Reis', username: 'dario_reis' },
    });
  });

  it('forwards a captcha token when one is provided', async () => {
    signUp.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });

    await createAccountService.createAccount(VALID_PAYLOAD, 'captcha-token');

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.objectContaining({ captchaToken: 'captcha-token' }) }),
    );
  });

  it('resolves with a generic error when Supabase rejects the sign-up', async () => {
    signUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Password should be at least 12 characters' },
    });

    const result = await createAccountService.createAccount(VALID_PAYLOAD);

    expect(result).toEqual({
      success: false,
      error: 'Não foi possível criar sua conta. Tente novamente.',
    });
  });
});
