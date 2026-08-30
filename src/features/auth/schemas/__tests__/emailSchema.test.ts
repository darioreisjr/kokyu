import { describe, expect, it } from 'vitest';

import { emailSchema } from '../emailSchema';

describe('emailSchema', () => {
  it('requires a value', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe seu e-mail');
  });

  it('rejects an invalid format', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe um e-mail válido');
  });

  it('accepts a valid email', () => {
    const result = emailSchema.safeParse('usuario@example.com');
    expect(result.success).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    const result = emailSchema.safeParse('  usuario@example.com  ');
    expect(result.success).toBe(true);
    expect(result.data).toBe('usuario@example.com');
  });

  it('normalizes casing to lowercase', () => {
    const result = emailSchema.safeParse('Usuario@Example.COM');
    expect(result.success).toBe(true);
    expect(result.data).toBe('usuario@example.com');
  });

  it('rejects a value that is only whitespace', () => {
    const result = emailSchema.safeParse('   ');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe seu e-mail');
  });
});
