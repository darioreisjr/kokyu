import { describe, expect, it } from 'vitest';

import { getPasswordStrength } from '../passwordStrength';

describe('getPasswordStrength', () => {
  it('is weak for an empty password', () => {
    expect(getPasswordStrength('')).toBe('weak');
  });

  it('is weak when only one or two requirements are met', () => {
    expect(getPasswordStrength('abc')).toBe('weak');
  });

  it('is medium when three or four requirements are met', () => {
    expect(getPasswordStrength('abcdefghijkl1')).toBe('medium');
  });

  it('is strong once every requirement is met', () => {
    expect(getPasswordStrength('Abcdefgh123!')).toBe('strong');
  });

  it('never regresses to weak once the full policy is satisfied, regardless of length', () => {
    expect(getPasswordStrength('Ab1!Ab1!Ab1!Ab1!')).toBe('strong');
  });
});
