import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAccountSchema } from '../createAccountSchema';

const VALID_BASE = {
  firstName: 'Dario',
  lastName: 'Reis',
  username: 'dario_reis',
  password: 'Abcdefg1!',
  confirmPassword: 'Abcdefg1!',
};

function parse(overrides: Partial<Record<string, unknown>> = {}) {
  return createAccountSchema.safeParse({ ...VALID_BASE, ...overrides });
}

function firstMessage(result: ReturnType<typeof parse>, field?: string) {
  if (result.success) return undefined;
  const issue = field
    ? result.error.issues.find((i) => i.path[0] === field)
    : result.error.issues[0];
  return issue?.message;
}

describe('createAccountSchema', () => {
  beforeEach(() => {
    // "Today" is mocked — the 18-year-old checks below must never
    // depend on the machine's real clock.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 28, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a fully valid submission', () => {
    const result = parse({ birthDate: new Date(2000, 0, 1) });
    expect(result.success).toBe(true);
  });

  it('requires firstName', () => {
    expect(
      firstMessage(parse({ firstName: '', birthDate: new Date(2000, 0, 1) }), 'firstName'),
    ).toBe('Informe seu nome');
  });

  it('rejects a firstName that is only whitespace', () => {
    expect(
      firstMessage(parse({ firstName: '   ', birthDate: new Date(2000, 0, 1) }), 'firstName'),
    ).toBe('Informe seu nome');
  });

  it('requires lastName', () => {
    expect(firstMessage(parse({ lastName: '', birthDate: new Date(2000, 0, 1) }), 'lastName')).toBe(
      'Informe seu sobrenome',
    );
  });

  it('accepts a compound surname', () => {
    const result = parse({ lastName: 'Reis Almeida', birthDate: new Date(2000, 0, 1) });
    expect(result.success).toBe(true);
  });

  it.each(['da', 'dario reis', '@dario', '_dario'])(
    'rejects the invalid username "%s"',
    (username) => {
      const result = parse({ username, birthDate: new Date(2000, 0, 1) });
      expect(result.success).toBe(false);
    },
  );

  it('requires a birth date', () => {
    expect(firstMessage(parse({ birthDate: undefined }), 'birthDate')).toBe(
      'Informe sua data de nascimento',
    );
  });

  it('rejects a future birth date', () => {
    expect(firstMessage(parse({ birthDate: new Date(2030, 0, 1) }), 'birthDate')).toBe(
      'Informe uma data de nascimento válida',
    );
  });

  it('rejects someone who turns 18 tomorrow', () => {
    expect(firstMessage(parse({ birthDate: new Date(2008, 7, 29) }), 'birthDate')).toBe(
      'Você precisa ter pelo menos 18 anos para criar uma conta',
    );
  });

  it('accepts someone whose 18th birthday is exactly today', () => {
    const result = parse({ birthDate: new Date(2008, 7, 28) });
    expect(result.success).toBe(true);
  });

  it.each(['abc', 'abcdefgh', 'Abcdefgh', 'Abcdefg1'])(
    'rejects the password "%s" for not meeting every requirement',
    (password) => {
      const result = parse({
        password,
        confirmPassword: password,
        birthDate: new Date(2000, 0, 1),
      });
      expect(result.success).toBe(false);
    },
  );

  it('rejects a mismatched confirmation, attached to confirmPassword', () => {
    const result = parse({ confirmPassword: 'Different1!', birthDate: new Date(2000, 0, 1) });
    expect(firstMessage(result, 'confirmPassword')).toBe('As senhas não coincidem');
  });

  it('accepts a matching confirmation', () => {
    const result = parse({ birthDate: new Date(2000, 0, 1) });
    expect(result.success).toBe(true);
  });
});
