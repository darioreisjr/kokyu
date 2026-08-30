import { describe, expect, it } from 'vitest';

import { getMetPasswordRequirements, meetsAllPasswordRequirements } from '../passwordRequirements';

describe('password requirements', () => {
  it.each([
    ['abc', 'too short and missing every character class'],
    ['abcdefgh', 'long enough but only lowercase'],
    ['Abcdefgh', 'missing a number and a special character'],
    ['Abcdefg1', 'missing a special character'],
  ])('"%s" does not meet every requirement (%s)', (password) => {
    expect(meetsAllPasswordRequirements(password)).toBe(false);
  });

  it('"Abcdefg1!" meets every requirement', () => {
    expect(meetsAllPasswordRequirements('Abcdefg1!')).toBe(true);
  });

  it('reports exactly which requirements a partial password meets', () => {
    const met = getMetPasswordRequirements('abc').map((requirement) => requirement.id);
    expect(met).toEqual(['lowercase']);
  });

  it('accepts accented letters for the uppercase/lowercase requirements', () => {
    expect(meetsAllPasswordRequirements('Àbcdefg1!')).toBe(true);
  });
});
