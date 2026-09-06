import { format } from 'date-fns';

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
  async checkUsernameAvailability(): Promise<UsernameAvailabilityResult> {
    // The kokyu-sam backend doesn't expose a public availability-check
    // endpoint (checking one would need anon read access to
    // public.profiles, which RLS deliberately denies — see its
    // docs/security.md). Uniqueness is still enforced for real: a
    // case-insensitive unique index on profiles.username, backed by the
    // handle_new_user() trigger, which silently omits a colliding
    // username at signup rather than failing it (see the trigger's own
    // migration). Until a dedicated endpoint exists, this can only ever
    // report "available" — it has no way to check without either lying
    // or calling something that doesn't exist.
    return { available: true };
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
