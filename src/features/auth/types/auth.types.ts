export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export type AuthResult = { success: true; user: AuthUser } | { success: false; error: string };

/**
 * Contract every future auth provider (Auth.js, Cognito, Firebase, ...)
 * must satisfy. UI code depends only on this interface, never on a
 * concrete provider — see `services/authService.ts`.
 */
export interface AuthService {
  signInWithCredentials: (credentials: AuthCredentials, captchaToken?: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}
