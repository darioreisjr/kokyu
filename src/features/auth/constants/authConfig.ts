/** Centralized, non-visual configuration for the auth feature. */
export const authConfig = {
  /** Debounce before checking username availability, in ms. */
  usernameCheckDebounceMs: 400,
  minAccountAge: 18,
  username: {
    minLength: 3,
    maxLength: 30,
  },
  /** How long the "Enviar novamente" action stays disabled after a request. */
  passwordRecoveryResendCooldownSeconds: 30,
} as const;
