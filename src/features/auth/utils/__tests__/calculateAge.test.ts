import { describe, expect, it } from 'vitest';

import { calculateAge } from '../calculateAge';

// The numeric `Date` constructor is always local time — unlike a
// date-only ISO string (parsed as UTC) mixed with a date-time one
// (parsed as local), which would make this suite's result depend on
// the machine's timezone. `2026-08-28`, month is 0-indexed.
const TODAY = new Date(2026, 7, 28, 12, 0, 0);

describe('calculateAge', () => {
  it("returns 17 when the birthday hasn't happened yet this year", () => {
    expect(calculateAge(new Date(2008, 7, 29), TODAY)).toBe(17);
  });

  it('returns 18 on the exact birthday', () => {
    expect(calculateAge(new Date(2008, 7, 28), TODAY)).toBe(18);
  });

  it('returns 18 the day after the birthday already passed', () => {
    expect(calculateAge(new Date(2008, 7, 27), TODAY)).toBe(18);
  });

  it("subtracts a year when the birth month hasn't been reached yet", () => {
    expect(calculateAge(new Date(2008, 8, 1), TODAY)).toBe(17);
  });

  it('counts the full year once the birth month has passed', () => {
    expect(calculateAge(new Date(2008, 0, 1), TODAY)).toBe(18);
  });

  it('handles a leap-day birthday correctly', () => {
    // 2026-08-28 reference is well past Feb 29 either way; verify the
    // month/day comparison itself doesn't choke on a Feb 29 birth date.
    expect(calculateAge(new Date(2008, 1, 29), TODAY)).toBe(18);
    expect(calculateAge(new Date(2008, 1, 29), new Date(2026, 1, 28, 12, 0, 0))).toBe(17);
  });

  it('returns 0 for a newborn', () => {
    expect(calculateAge(new Date(2026, 7, 28), TODAY)).toBe(0);
  });
});
