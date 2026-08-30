import { describe, expect, it } from 'vitest';

import { getInitials } from '../getInitials';

describe('getInitials', () => {
  it('combines the first letter of each name, uppercased', () => {
    expect(getInitials('Dario', 'Reis')).toBe('DR');
  });

  it('uppercases lowercase input', () => {
    expect(getInitials('dario', 'reis')).toBe('DR');
  });

  it('trims surrounding whitespace before reading the first letter', () => {
    expect(getInitials('  Dario', 'Reis  ')).toBe('DR');
  });

  it('handles a missing surname gracefully', () => {
    expect(getInitials('Dario', '')).toBe('D');
  });
});
