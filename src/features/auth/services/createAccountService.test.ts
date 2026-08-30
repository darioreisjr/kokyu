import { describe, expect, it } from 'vitest';

import { createAccountService, mapFormDataToPayload } from './createAccountService';

describe('mapFormDataToPayload', () => {
  it('narrows form data into a payload, formatting the birth date and dropping confirmPassword', () => {
    const payload = mapFormDataToPayload({
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'dario_reis',
      birthDate: new Date(2000, 7, 28),
      password: 'Abcdefg1!',
      confirmPassword: 'Abcdefg1!',
    });

    expect(payload).toEqual({
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'dario_reis',
      birthDate: '2000-08-28',
      password: 'Abcdefg1!',
    });
    expect(payload).not.toHaveProperty('confirmPassword');
  });
});

describe('createAccountService (mock provider)', () => {
  it('reports a known taken username as unavailable', async () => {
    const result = await createAccountService.checkUsernameAvailability('admin');
    expect(result).toEqual({ available: false, reason: 'taken' });
  });

  it('treats the taken-username check as case-insensitive', async () => {
    const result = await createAccountService.checkUsernameAvailability('Admin');
    expect(result.available).toBe(false);
  });

  it('reports any other username as available', async () => {
    const result = await createAccountService.checkUsernameAvailability('dario_reis');
    expect(result).toEqual({ available: true });
  });

  it('resolves account creation as successful with the given profile', async () => {
    const result = await createAccountService.createAccount({
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'dario_reis',
      birthDate: '2000-08-28',
      password: 'Abcdefg1!',
    });

    expect(result).toEqual({
      success: true,
      user: { id: 'mock-account', firstName: 'Dario', lastName: 'Reis', username: 'dario_reis' },
    });
  });
});
