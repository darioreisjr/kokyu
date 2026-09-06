import { createClient } from '@/lib/supabase/client';

import { authText } from '../constants/authText';
import type { AuthCredentials, AuthResult, AuthService } from '../types/auth.types';

const EMAIL_NOT_CONFIRMED_CODE = 'email_not_confirmed';

/**
 * Real Supabase Auth implementation. `components`/`hooks` only depend on
 * the `AuthService` contract, so nothing above this file changed when it
 * stopped being a mock.
 */
const supabaseAuthService: AuthService = {
  async signInWithCredentials(
    { email, password }: AuthCredentials,
    captchaToken?: string,
  ): Promise<AuthResult> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });

    if (error) {
      // Only ever distinguish "email not confirmed" — Supabase's own
      // stable error `code`, not a message string. Every other failure
      // (wrong password, unknown email, rate limited, ...) collapses
      // into the same generic message so the UI can't be used to
      // enumerate which emails have an account.
      if (error.code === EMAIL_NOT_CONFIRMED_CODE) {
        return { success: false, error: authText.login.emailNotConfirmedError };
      }
      return { success: false, error: authText.login.invalidCredentialsError };
    }

    return { success: true, user: { id: data.user.id, email: data.user.email ?? email } };
  },

  async signInWithGoogle(): Promise<AuthResult> {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid email profile',
      },
    });

    if (error) {
      return { success: false, error: authText.login.genericError };
    }

    // `signInWithOAuth` already redirected this tab to Google's consent
    // screen — there is no success value to return because the page is
    // navigating away. Never resolving keeps the caller's loading state
    // active for the rest of this page's lifetime instead of fabricating
    // a placeholder `AuthUser` that would never actually be used.
    return new Promise<AuthResult>(() => {});
  },

  async signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
  },
};

export const authService: AuthService = supabaseAuthService;
