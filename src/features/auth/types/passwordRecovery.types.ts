export interface PasswordRecoveryRequest {
  email: string;
}

export type PasswordRecoveryResult = { success: true } | { success: false; error: string };

/**
 * Contract for a future real recovery-request call (send email, issue a
 * token, ...). Mocked for now — see `services/passwordRecoveryService.ts`.
 * Deliberately has no way to report "email not found": whether the
 * address is registered is never observable from this contract, so the
 * UI can't leak it even by accident.
 */
export interface PasswordRecoveryService {
  requestPasswordRecovery: (request: PasswordRecoveryRequest) => Promise<PasswordRecoveryResult>;
}
