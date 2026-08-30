import { describe, expect, it } from 'vitest';

import { scheduleEntryFormDefaultValues, scheduleEntryFormSchema } from './scheduleEntrySchema';

describe('scheduleEntryFormSchema', () => {
  it('parses a valid schedule entry form', () => {
    const result = scheduleEntryFormSchema.safeParse({
      routineId: 'routine-push-a',
      date: new Date('2026-08-29'),
      time: '19:00',
      estimatedDurationMinutes: 60,
      recurrence: 'weekly',
      reminder: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts its own default values except the empty routineId', () => {
    // defaults intentionally leave routineId blank until the user picks a routine
    expect(scheduleEntryFormSchema.safeParse(scheduleEntryFormDefaultValues).success).toBe(false);
    expect(
      scheduleEntryFormSchema.safeParse({
        ...scheduleEntryFormDefaultValues,
        routineId: 'routine-push-a',
      }).success,
    ).toBe(true);
  });

  it('fails when routineId is empty', () => {
    const result = scheduleEntryFormSchema.safeParse({
      ...scheduleEntryFormDefaultValues,
      routineId: '',
    });
    expect(result.success).toBe(false);
  });

  it('fails when date is not a Date instance', () => {
    const result = scheduleEntryFormSchema.safeParse({
      ...scheduleEntryFormDefaultValues,
      routineId: 'routine-push-a',
      date: '2026-08-29',
    });
    expect(result.success).toBe(false);
  });

  it('fails on an invalid recurrence value', () => {
    const result = scheduleEntryFormSchema.safeParse({
      ...scheduleEntryFormDefaultValues,
      routineId: 'routine-push-a',
      recurrence: 'monthly',
    });
    expect(result.success).toBe(false);
  });
});
