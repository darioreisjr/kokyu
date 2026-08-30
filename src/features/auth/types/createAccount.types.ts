/** Everything the create-account form collects, including client-only fields. */
export interface CreateAccountFormData {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: Date;
  password: string;
  confirmPassword: string;
}

/**
 * What actually gets sent to a future API — deliberately narrower
 * than the form: `confirmPassword` never leaves the browser (it only
 * exists to validate the form) and `birthDate` is serialized to an
 * ISO date string. See `services/createAccountService.ts`'s mapper.
 */
export interface CreateAccountPayload {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  password: string;
}

export interface CreateAccountUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export type CreateAccountResult =
  { success: true; user: CreateAccountUser } | { success: false; error: string };

export type UsernameAvailability =
  | 'idle'
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'error'
  /** Equal to the caller-supplied original value (e.g. editing a profile without touching the username) — never worth asking the service about. */
  | 'unchanged';

export type UsernameAvailabilityResult =
  { available: true } | { available: false; reason: 'taken' | 'error' };

/**
 * Contract for a future real username-availability check. Mocked for
 * now (`services/createAccountService.ts`), same pattern as `AuthService`.
 */
export interface UsernameAvailabilityService {
  checkUsernameAvailability: (username: string) => Promise<UsernameAvailabilityResult>;
}

/** Contract for a future real account-creation call. Mocked for now. */
export interface CreateAccountService extends UsernameAvailabilityService {
  createAccount: (payload: CreateAccountPayload) => Promise<CreateAccountResult>;
}
