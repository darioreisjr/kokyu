import { describe, expect, it } from 'vitest';

import { isUsernameFormatValid } from '../username';

describe('isUsernameFormatValid', () => {
  it.each(['darioreis', 'dario', 'dario_reis', 'dario.reis', 'dario123'])(
    'accepts "%s"',
    (username) => {
      expect(isUsernameFormatValid(username)).toBe(true);
    },
  );

  it.each([
    ['da', 'shorter than the 3-character minimum'],
    ['dario reis', 'contains a space'],
    ['@dario', "starts with '@'"],
    ['_dario', 'starts with an underscore, not a letter'],
    ['1dario', 'starts with a digit, not a letter'],
    ['a'.repeat(31), 'longer than the 30-character maximum'],
  ])('rejects "%s" (%s)', (username) => {
    expect(isUsernameFormatValid(username)).toBe(false);
  });

  it('is case-insensitive — an uppercase username normalizes before validation', () => {
    expect(isUsernameFormatValid('DarioReis')).toBe(true);
  });
});
