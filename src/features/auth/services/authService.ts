import type { AuthCredentials, AuthResult, AuthService } from '../types/auth.types';

/**
 * Mocked implementation used while there is no backend. It never
 * touches the network and never handles real credentials — it only
 * lets the UI exercise its loading/success/error states.
 *
 * Swap `authService` below for a real implementation (Auth.js,
 * Cognito, Firebase, ...) once a provider is chosen; nothing in
 * `components` or `hooks` needs to change, since they only depend on
 * the `AuthService` contract.
 */
const mockAuthService: AuthService = {
  async signInWithCredentials({ email }: AuthCredentials): Promise<AuthResult> {
    return { success: true, user: { id: 'mock-user', email } };
  },

  async signInWithGoogle(): Promise<AuthResult> {
    return {
      success: true,
      user: { id: 'mock-google-user', email: 'mock.google.user@example.com' },
    };
  },

  async signOut(): Promise<void> {
    // No real session exists to invalidate yet — this mock only gives
    // the sidebar's "Sair" a contract to call through, same pattern as
    // every other method here.
  },
};

export const authService: AuthService = mockAuthService;
