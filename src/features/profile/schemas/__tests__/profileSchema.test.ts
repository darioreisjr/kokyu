import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { profileSchema } from '../profileSchema';

const VALID_BASE = {
  firstName: 'Dario',
  lastName: 'Reis',
  username: 'dario_reis',
  bio: 'Organizando cada parte da minha rotina.',
  country: 'BR',
  region: 'SP',
  city: 'São Paulo',
};

function parse(overrides: Partial<Record<string, unknown>> = {}) {
  return profileSchema.safeParse({ ...VALID_BASE, ...overrides });
}

function firstMessage(result: ReturnType<typeof parse>, field?: string) {
  if (result.success) return undefined;
  const issue = field
    ? result.error.issues.find((i) => i.path[0] === field)
    : result.error.issues[0];
  return issue?.message;
}

describe('profileSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 28, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a fully valid profile', () => {
    const result = parse({ birthDate: new Date(2000, 0, 1) });
    expect(result.success).toBe(true);
  });

  it('requires firstName (reusing the same rule as create-account)', () => {
    expect(
      firstMessage(parse({ firstName: '  ', birthDate: new Date(2000, 0, 1) }), 'firstName'),
    ).toBe('Informe seu nome');
  });

  it('requires lastName', () => {
    expect(firstMessage(parse({ lastName: '', birthDate: new Date(2000, 0, 1) }), 'lastName')).toBe(
      'Informe seu sobrenome',
    );
  });

  it('accepts a compound surname', () => {
    expect(parse({ lastName: 'Reis Almeida', birthDate: new Date(2000, 0, 1) }).success).toBe(true);
  });

  it.each(['da', 'dario reis', '@dario', '_dario'])(
    'rejects the same invalid usernames create-account rejects: "%s"',
    (username) => {
      expect(parse({ username, birthDate: new Date(2000, 0, 1) }).success).toBe(false);
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

  it('rejects someone who turns 18 tomorrow, with the profile-specific message', () => {
    expect(firstMessage(parse({ birthDate: new Date(2008, 7, 29) }), 'birthDate')).toBe(
      'Você precisa ter pelo menos 18 anos.',
    );
  });

  it('accepts someone whose 18th birthday is exactly today', () => {
    expect(parse({ birthDate: new Date(2008, 7, 28) }).success).toBe(true);
  });

  it('accepts an empty bio', () => {
    expect(parse({ bio: '', birthDate: new Date(2000, 0, 1) }).success).toBe(true);
  });

  it('accepts a bio at exactly the 160-character limit', () => {
    const bio = 'a'.repeat(160);
    expect(parse({ bio, birthDate: new Date(2000, 0, 1) }).success).toBe(true);
  });

  it('rejects a bio over the 160-character limit', () => {
    const bio = 'a'.repeat(161);
    const result = parse({ bio, birthDate: new Date(2000, 0, 1) });
    expect(result.success).toBe(false);
    expect(firstMessage(result, 'bio')).toBe('A bio deve ter no máximo 160 caracteres');
  });

  it('allows country/region/city to be empty (optional fields)', () => {
    const result = parse({
      country: '',
      region: '',
      city: '',
      birthDate: new Date(2000, 0, 1),
    });
    expect(result.success).toBe(true);
  });
});
