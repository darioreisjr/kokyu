import { format } from 'date-fns';

import { apiRequest } from '@/lib/api/request';
import type { UsernameAvailabilityResponse } from '@/lib/api/types';
import { createClient } from '@/lib/supabase/client';

import { authText } from '../constants/authText';
import type {
  CreateAccountFormData,
  CreateAccountPayload,
  CreateAccountResult,
  CreateAccountService,
  UsernameAvailabilityResult,
} from '../types/createAccount.types';

/**
 * `CreateAccountFormData` (what the form collects, including
 * `confirmPassword`) is never the same shape as what Supabase's
 * `signUp` accepts. This mapper is the one place that narrows one into
 * the other — `confirmPassword` never leaves the browser, and
 * `birthDate` becomes a plain date string. Formatted with `date-fns`
 * in local time rather than `toISOString()` (which converts to UTC
 * and can shift the calendar date by one day for timezones ahead of
 * UTC, since the picker's value is local midnight).
 */
export function mapFormDataToPayload(formData: CreateAccountFormData): CreateAccountPayload {
  return {
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    username: formData.username,
    birthDate: format(formData.birthDate, 'yyyy-MM-dd'),
    password: formData.password,
  };
}

/**
 * Real Supabase Auth implementation. `CreateAccountForm` and its hook
 * only depend on the `CreateAccountService` contract, so nothing above
 * this file changed when it stopped being a mock.
 */
const supabaseCreateAccountService: CreateAccountService = {
  async checkUsernameAvailability(username: string): Promise<UsernameAvailabilityResult> {
    // `GET /usernames/availability` needs no auth — this can run for a
    // not-yet-authenticated visitor filling out create-account, and for
    // an already-authenticated one editing their profile/onboarding
    // (both go through `useUsernameAvailability`, the one shared hook).
    try {
      const result = await apiRequest<UsernameAvailabilityResponse>(
        `/usernames/availability?username=${encodeURIComponent(username)}`,
      );
      return result.available ? { available: true } : { available: false, reason: 'taken' };
    } catch {
      return { available: false, reason: 'error' };
    }
  },

  async createAccount(
    payload: CreateAccountPayload,
    captchaToken?: string,
  ): Promise<CreateAccountResult> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        captchaToken,
        // Copied verbatim into auth.users.raw_user_meta_data, which
        // handle_new_user() reads to seed public.profiles — snake_case
        // keys to match exactly what that trigger expects.
        data: {
          first_name: payload.firstName,
          last_name: payload.lastName,
          username: payload.username,
          birth_date: payload.birthDate,
        },
      },
    });

    if (error || !data.user) {
      return { success: false, error: authText.createAccount.genericError };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
      },
    };
  },
};

export const createAccountService: CreateAccountService = supabaseCreateAccountService;
