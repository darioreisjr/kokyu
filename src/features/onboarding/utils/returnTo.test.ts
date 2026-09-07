import { describe, expect, it } from 'vitest';

import { sanitizeReturnTo } from './returnTo';

describe('sanitizeReturnTo', () => {
  it('accepts a real /app/** path', () => {
    expect(sanitizeReturnTo('/app/treinamento')).toBe('/app/treinamento');
    expect(sanitizeReturnTo('/app')).toBe('/app');
  });

  it('rejects null/undefined/empty', () => {
    expect(sanitizeReturnTo(null)).toBeNull();
    expect(sanitizeReturnTo(undefined)).toBeNull();
    expect(sanitizeReturnTo('')).toBeNull();
  });

  it('rejects anything outside /app', () => {
    expect(sanitizeReturnTo('/login')).toBeNull();
    expect(sanitizeReturnTo('/perfil/completar')).toBeNull();
    expect(sanitizeReturnTo('appearance')).toBeNull();
  });

  it('rejects protocol-relative and external URLs', () => {
    expect(sanitizeReturnTo('//evil.com/app')).toBeNull();
    expect(sanitizeReturnTo('https://evil.com/app')).toBeNull();
    expect(sanitizeReturnTo('javascript:alert(1)')).toBeNull();
  });
});
