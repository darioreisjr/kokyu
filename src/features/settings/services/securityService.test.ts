import { describe, expect, it } from 'vitest';

import { securityService } from './securityService';

describe('securityService (mock)', () => {
  it('changePassword succeeds for a non-empty current password', async () => {
    const result = await securityService.changePassword('minha-senha-atual', 'NovaSenha123!');
    expect(result.success).toBe(true);
  });

  it('changePassword reports an error for an empty current password', async () => {
    const result = await securityService.changePassword('', 'NovaSenha123!');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
