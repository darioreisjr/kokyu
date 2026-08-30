import { format } from 'date-fns';

import type {
  CreateAccountFormData,
  CreateAccountPayload,
  CreateAccountResult,
  CreateAccountService,
  UsernameAvailabilityResult,
} from '../types/createAccount.types';

/**
 * `CreateAccountFormData` (what the form collects, including
 * `confirmPassword`) is never the same shape as what a future API
 * would accept. This mapper is the one place that narrows one into
 * the other — `confirmPassword` never leaves the browser, and
 * `birthDate` becomes a plain date string. Formatted with `date-fns`
 * in local time rather than `toISOString()` (which converts to UTC
 * and can shift the calendar date by one day for timezones ahead of
 * UTC, since the picker's value is local midnight).
 */
export function mapFormDataToPayload(formData: CreateAccountFormData): CreateAccountPayload {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    username: formData.username,
    birthDate: format(formData.birthDate, 'yyyy-MM-dd'),
    password: formData.password,
  };
}

/** Usernames the mock treats as already taken, to exercise the "unavailable" state deterministically. */
const MOCK_TAKEN_USERNAMES = new Set(['admin', 'kokyu', 'suporte', 'teste']);

/**
 * Mocked implementation used while there is no backend — same
 * pattern as `authService`. Swapping to a real API later means
 * replacing this file only; `CreateAccountForm` and its hook only
 * depend on the `CreateAccountService` contract.
 */
const mockCreateAccountService: CreateAccountService = {
  async checkUsernameAvailability(username: string): Promise<UsernameAvailabilityResult> {
    if (MOCK_TAKEN_USERNAMES.has(username.toLowerCase())) {
      return { available: false, reason: 'taken' };
    }
    return { available: true };
  },

  async createAccount(payload: CreateAccountPayload): Promise<CreateAccountResult> {
    return {
      success: true,
      user: {
        id: 'mock-account',
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
      },
    };
  },
};

export const createAccountService: CreateAccountService = mockCreateAccountService;
