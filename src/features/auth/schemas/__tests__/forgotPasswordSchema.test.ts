import { describe, expect, it } from 'vitest';

import { forgotPasswordSchema } from '../forgotPasswordSchema';

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'usuario@example.com' });
    expect(result.success).toBe(true);
  });

  it('requires an email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe seu e-mail');
  });

  it('rejects an invalid email format', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'email-invalido' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe um e-mail válido');
  });
});
