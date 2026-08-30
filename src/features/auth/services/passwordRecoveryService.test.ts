import { describe, expect, it } from 'vitest';

import { passwordRecoveryService } from './passwordRecoveryService';

describe('passwordRecoveryService (mock provider)', () => {
  it('resolves as successful for an email that looks registered', async () => {
    const result = await passwordRecoveryService.requestPasswordRecovery({
      email: 'usuario@example.com',
    });
    expect(result).toEqual({ success: true });
  });

  it('resolves identically for an email that is not registered — the mock never models a "not found" outcome', async () => {
    const result = await passwordRecoveryService.requestPasswordRecovery({
      email: 'ninguem-tem-essa-conta@example.com',
    });
    expect(result).toEqual({ success: true });
  });
});
