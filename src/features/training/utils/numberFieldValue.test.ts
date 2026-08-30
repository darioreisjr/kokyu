import { describe, expect, it } from 'vitest';

import { parseOptionalNumberFieldValue } from './numberFieldValue';

describe('parseOptionalNumberFieldValue', () => {
  it('returns undefined for an empty string instead of NaN', () => {
    expect(parseOptionalNumberFieldValue('')).toBeUndefined();
  });

  it('returns undefined for whitespace-only input', () => {
    expect(parseOptionalNumberFieldValue('   ')).toBeUndefined();
  });

  it('parses a valid numeric string', () => {
    expect(parseOptionalNumberFieldValue('12.5')).toBe(12.5);
  });

  it('returns undefined for a non-numeric string rather than NaN', () => {
    expect(parseOptionalNumberFieldValue('abc')).toBeUndefined();
  });

  it('passes a real number straight through instead of throwing', () => {
    // react-hook-form re-invokes setValueAs on a value already sitting in form state (e.g. right
    // after useFieldArray.append() seeds a row with a real number) — must not throw on .trim().
    expect(parseOptionalNumberFieldValue(8)).toBe(8);
  });

  it('returns undefined for NaN, null, and undefined without throwing', () => {
    expect(parseOptionalNumberFieldValue(Number.NaN)).toBeUndefined();
    expect(parseOptionalNumberFieldValue(null)).toBeUndefined();
    expect(parseOptionalNumberFieldValue(undefined)).toBeUndefined();
  });
});
