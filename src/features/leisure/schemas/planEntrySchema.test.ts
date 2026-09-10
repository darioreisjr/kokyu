import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildPlanEntrySchema, planEntryDefaultValues, planEntrySchema } from './planEntrySchema';

describe('planEntrySchema', () => {
  it('accepts a valid plan entry', () => {
    const result = planEntrySchema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler O Hobbit',
      date: '2030-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    expect(
      planEntrySchema.safeParse({ ...planEntryDefaultValues, date: '2030-01-01' }).success,
    ).toBe(false);
  });

  it('rejects a missing date', () => {
    expect(
      planEntrySchema.safeParse({ ...planEntryDefaultValues, title: 'Ler O Hobbit' }).success,
    ).toBe(false);
  });

  it('rejects a negative duration', () => {
    const result = planEntrySchema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler',
      date: '2030-01-01',
      duration: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe('planEntrySchema — not in the past (create, no reference)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T14:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects a past date', () => {
    const result = planEntrySchema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler',
      date: '2026-06-14',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['date']);
  });

  it('accepts today', () => {
    expect(
      planEntrySchema.safeParse({ ...planEntryDefaultValues, title: 'Ler', date: '2026-06-15' })
        .success,
    ).toBe(true);
  });

  it('accepts a future date', () => {
    expect(
      planEntrySchema.safeParse({ ...planEntryDefaultValues, title: 'Ler', date: '2026-06-16' })
        .success,
    ).toBe(true);
  });

  it('rejects a startTime earlier than now on today', () => {
    const result = planEntrySchema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler',
      date: '2026-06-15',
      startTime: '10:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['startTime']);
  });

  it('accepts a startTime later than now on today', () => {
    expect(
      planEntrySchema.safeParse({
        ...planEntryDefaultValues,
        title: 'Ler',
        date: '2026-06-15',
        startTime: '18:00',
      }).success,
    ).toBe(true);
  });

  it('rejects an endTime earlier than now on today', () => {
    const result = planEntrySchema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler',
      date: '2026-06-15',
      endTime: '10:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['endTime']);
  });

  it('accepts any time on a future date', () => {
    expect(
      planEntrySchema.safeParse({
        ...planEntryDefaultValues,
        title: 'Ler',
        date: '2026-06-16',
        startTime: '00:00',
      }).success,
    ).toBe(true);
  });
});

describe('buildPlanEntrySchema — edit leniency (with reference)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T14:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows keeping an already-past date/time unchanged', () => {
    const schema = buildPlanEntrySchema({ date: '2020-01-01', startTime: '10:00' });
    const result = schema.safeParse({
      ...planEntryDefaultValues,
      title: 'Notas atualizadas',
      date: '2020-01-01',
      startTime: '10:00',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rescheduling to a different past date', () => {
    const schema = buildPlanEntrySchema({ date: '2020-01-01' });
    const result = schema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler',
      date: '2020-06-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['date']);
  });

  it('accepts rescheduling a past entry to a future date', () => {
    const schema = buildPlanEntrySchema({ date: '2020-01-01' });
    const result = schema.safeParse({ ...planEntryDefaultValues, title: 'Ler', date: '2026-06-20' });
    expect(result.success).toBe(true);
  });

  it('re-validates startTime against now when the date changes to today', () => {
    const schema = buildPlanEntrySchema({ date: '2026-06-20', startTime: '10:00' });
    const result = schema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler',
      date: '2026-06-15',
      startTime: '10:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['startTime']);
  });
});
