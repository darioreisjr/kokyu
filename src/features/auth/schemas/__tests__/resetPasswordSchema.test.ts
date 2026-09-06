import { describe, expect, it } from 'vitest';

import { resetPasswordSchema } from '../resetPasswordSchema';

const VALID_PASSWORD = 'Abcdefgh123!';

describe('resetPasswordSchema', () => {
  it('accepts a valid, matching password', () => {
    const result = resetPasswordSchema.safeParse({
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });
    expect(result.success).toBe(true);
  });

  it('requires a password', () => {
    const result = resetPasswordSchema.safeParse({ password: '', confirmPassword: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.find((i) => i.path[0] === 'password')?.message).toBe(
      'Informe sua nova senha',
    );
  });

  it('rejects a password that does not meet every requirement', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a mismatched confirmation, attached to confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      password: VALID_PASSWORD,
      confirmPassword: 'Different123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword');
      expect(issue?.message).toBe('As senhas não coincidem');
    }
  });
});
