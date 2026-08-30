/**
 * Every method here is a clearly-isolated mock — there is no backend
 * to authenticate a current password, issue a session, or store a new
 * one. `changePassword` never actually changes anything the app reads
 * from again; it only simulates the request/response shape a real
 * implementation would have, so `ChangePasswordDialog`'s UI and states
 * (loading, success, error) are real even though the result isn't.
 */
export interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

const MOCK_LATENCY_MS = 600;

export const securityService = {
  async changePassword(
    currentPassword: string,
    _newPassword: string,
  ): Promise<ChangePasswordResult> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    if (currentPassword.length === 0) {
      return { success: false, error: 'Senha atual incorreta.' };
    }
    return { success: true };
  },
};
