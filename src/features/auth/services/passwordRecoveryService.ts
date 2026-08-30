import type {
  PasswordRecoveryRequest,
  PasswordRecoveryResult,
  PasswordRecoveryService,
} from '../types/passwordRecovery.types';

/**
 * Mocked implementation used while there is no backend — same pattern
 * as `authService`/`createAccountService`. Always resolves successfully,
 * regardless of whether `email` belongs to a real account: whether an
 * address is registered must never be observable from the UI, so the
 * mock doesn't even model a "not found" outcome. Tests/stories that
 * need the generic-error state mock this module directly instead
 * (same technique `CreateAccountForm.test.tsx` uses for `createAccount`).
 */
const mockPasswordRecoveryService: PasswordRecoveryService = {
  async requestPasswordRecovery(
    _request: PasswordRecoveryRequest,
  ): Promise<PasswordRecoveryResult> {
    return { success: true };
  },
};

export const passwordRecoveryService: PasswordRecoveryService = mockPasswordRecoveryService;
