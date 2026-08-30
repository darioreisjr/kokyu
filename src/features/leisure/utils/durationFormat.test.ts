import { describe, expect, it } from 'vitest';

import { formatDuration } from './durationFormat';

describe('formatDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  it('formats an exact number of hours', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours with a remainder', () => {
    expect(formatDuration(90)).toBe('1h30');
  });

  it('pads a single-digit remainder', () => {
    expect(formatDuration(65)).toBe('1h05');
  });
});
