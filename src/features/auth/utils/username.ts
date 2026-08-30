import { authConfig } from '../constants/authConfig';

/** Starts with a letter; lowercase letters, digits, `_` and `.` after that. */
export const USERNAME_PATTERN = /^[a-z][a-z0-9_.]*$/;

/**
 * Shape-only check (length + pattern), shared by `createAccountSchema`
 * and `useUsernameAvailability` — there's no point asking the mock
 * service about a username that's already structurally invalid.
 */
export function isUsernameFormatValid(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  return (
    normalized.length >= authConfig.username.minLength &&
    normalized.length <= authConfig.username.maxLength &&
    USERNAME_PATTERN.test(normalized)
  );
}
