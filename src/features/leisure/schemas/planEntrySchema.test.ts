import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildPlanEntrySchema, planEntryDefaultValues, planEntrySchema } from './planEntrySchema';

/** A fully-filled payload — every field the schema now requires. */
const validPayload = {
  ...planEntryDefaultValues,
  title: 'Ler O Hobbit',
  date: '2030-01-01',
  startTime: '10:00',
  endTime: '11:00',
  duration: 60,
};

describe('planEntrySchema', () => {
  it('accepts a valid plan entry', () => {
    const result = planEntrySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('accepts a valid plan entry with no notes (the only optional field)', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, notes: undefined });
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    expect(planEntrySchema.safeParse({ ...validPayload, title: '' }).success).toBe(false);
  });

  it('rejects a missing date', () => {
    expect(planEntrySchema.safeParse({ ...validPayload, date: '' }).success).toBe(false);
  });

  it('rejects a missing startTime', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, startTime: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['startTime']);
  });

  it('rejects a missing endTime', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, endTime: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['endTime']);
  });

  it('rejects a missing duration', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, duration: undefined });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['duration']);
  });

  it('rejects a negative duration', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, duration: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects a zero duration', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, duration: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer duration', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, duration: 12.5 });
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
    const result = planEntrySchema.safeParse({ ...validPayload, date: '2026-06-14' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['date']);
  });

  it('accepts today', () => {
    expect(
      planEntrySchema.safeParse({
        ...validPayload,
        date: '2026-06-15',
        startTime: '18:00',
        endTime: '19:00',
      }).success,
    ).toBe(true);
  });

  it('accepts a future date', () => {
    expect(planEntrySchema.safeParse({ ...validPayload, date: '2026-06-16' }).success).toBe(true);
  });

  it('rejects a startTime earlier than now on today', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      date: '2026-06-15',
      startTime: '10:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['startTime']);
  });

  it('accepts a startTime later than now on today', () => {
    expect(
      planEntrySchema.safeParse({
        ...validPayload,
        date: '2026-06-15',
        startTime: '18:00',
        endTime: '19:00',
      }).success,
    ).toBe(true);
  });

  it('rejects an endTime earlier than now on today', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      date: '2026-06-15',
      startTime: '18:00',
      endTime: '10:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['endTime']);
  });

  it('accepts any time on a future date', () => {
    expect(
      planEntrySchema.safeParse({ ...validPayload, date: '2026-06-16', startTime: '00:00' })
        .success,
    ).toBe(true);
  });
});

describe('planEntrySchema — recurrence "custom"', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T14:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a custom entry with one or more future dates', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2026-06-20', '2026-07-01'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a custom entry with no customDates at all', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, recurrence: 'custom' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['customDates']);
  });

  it('rejects a custom entry with an empty customDates array', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a custom entry with a past date among customDates', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2026-06-20', '2026-06-01'],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['customDates']);
  });

  it('does not require customDates for other recurrences', () => {
    const result = planEntrySchema.safeParse({ ...validPayload, recurrence: 'daily' });
    expect(result.success).toBe(true);
  });

  it('allows keeping an already-past customDate unchanged on edit', () => {
    const schema = buildPlanEntrySchema({ customDates: ['2020-01-01'] });
    const result = schema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2020-01-01'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects adding a new past customDate on edit', () => {
    const schema = buildPlanEntrySchema({ customDates: ['2020-01-01'] });
    const result = schema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2020-01-01', '2020-02-01'],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['customDates']);
  });

  // Regression: the hidden `date` field defaults to today (it's only ever
  // derived from customDates on submit, see PlanEntryFormPage), so a
  // startTime/endTime "not in the past" check keyed off `date` instead of
  // `customDates` used to fire even when none of the marked dates were
  // actually today.
  it('accepts a startTime earlier than now when today is not among the marked dates', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2026-06-16'],
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(result.success).toBe(true);
  });

  it('still rejects a startTime earlier than now when today is among the marked dates', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2026-06-15'],
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['startTime']);
  });

  it('accepts a startTime later than now when today is among several marked dates', () => {
    const result = planEntrySchema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2026-06-15', '2026-06-16'],
      startTime: '18:00',
      endTime: '19:00',
    });
    expect(result.success).toBe(true);
  });

  it('allows keeping an already-past startTime when today was already a marked date', () => {
    const schema = buildPlanEntrySchema({
      customDates: ['2026-06-15'],
      startTime: '10:00',
      endTime: '11:00',
    });
    const result = schema.safeParse({
      ...validPayload,
      recurrence: 'custom',
      customDates: ['2026-06-15'],
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(result.success).toBe(true);
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
      ...validPayload,
      title: 'Notas atualizadas',
      date: '2020-01-01',
      startTime: '10:00',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rescheduling to a different past date', () => {
    const schema = buildPlanEntrySchema({ date: '2020-01-01' });
    const result = schema.safeParse({ ...validPayload, date: '2020-06-01' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['date']);
  });

  it('accepts rescheduling a past entry to a future date', () => {
    const schema = buildPlanEntrySchema({ date: '2020-01-01' });
    const result = schema.safeParse({ ...validPayload, date: '2026-06-20' });
    expect(result.success).toBe(true);
  });

  it('re-validates startTime against now when the date changes to today', () => {
    const schema = buildPlanEntrySchema({ date: '2026-06-20', startTime: '10:00' });
    const result = schema.safeParse({ ...validPayload, date: '2026-06-15', startTime: '10:00' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]!.path).toEqual(['startTime']);
  });
});
