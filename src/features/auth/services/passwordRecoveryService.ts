import { createClient } from '@/lib/supabase/client';

import { authText } from '../constants/authText';
import type {
  PasswordRecoveryRequest,
  PasswordRecoveryResult,
  PasswordRecoveryService,
} from '../types/passwordRecovery.types';

/**
 * Real Supabase Auth implementation. `ForgotPasswordForm`/`ResetPasswordForm`
 * and their hooks only depend on the `PasswordRecoveryService` contract,
 * so nothing above this file changed when it stopped being a mock.
 */
const supabasePasswordRecoveryService: PasswordRecoveryService = {
  async requestPasswordRecovery(
    { email }: PasswordRecoveryRequest,
    captchaToken?: string,
  ): Promise<PasswordRecoveryResult> {
    const supabase = createClient();
    // Lands on the shared PKCE callback (`/auth/callback`), which
    // exchanges the emailed code for a session and only then redirects
    // to `/reset-password` — see that route's own doc comment.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      captchaToken,
    });

    // Supabase's own resetPasswordForEmail already never reveals whether
    // `email` belongs to a real account (it resolves the same way either
    // way) — any error reaching here is a real failure (captcha, rate
    // limit, network), never "account not found", so it's safe to
    // surface generically rather than mask unconditionally.
    if (error) {
      return { success: false, error: authText.forgotPassword.genericError };
    }

    return { success: true };
  },

  async updatePassword(newPassword: string): Promise<PasswordRecoveryResult> {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, error: authText.resetPassword.genericError };
    }

    return { success: true };
  },
};

export const passwordRecoveryService: PasswordRecoveryService = supabasePasswordRecoveryService;
