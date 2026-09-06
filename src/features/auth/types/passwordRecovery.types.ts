export interface PasswordRecoveryRequest {
  email: string;
}

export type PasswordRecoveryResult = { success: true } | { success: false; error: string };

/**
 * Contract for the recovery-request call (send email) and the
 * subsequent password update once the user lands on `/reset-password`
 * with a valid recovery session. Deliberately has no way for
 * `requestPasswordRecovery` to report "email not found": whether the
 * address is registered is never observable from this contract, so the
 * UI can't leak it even by accident.
 */
export interface PasswordRecoveryService {
  requestPasswordRecovery: (
    request: PasswordRecoveryRequest,
    captchaToken?: string,
  ) => Promise<PasswordRecoveryResult>;
  updatePassword: (newPassword: string) => Promise<PasswordRecoveryResult>;
}
