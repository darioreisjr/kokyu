import { describe, expect, it } from 'vitest';

import type { TrainingProgram } from '../types';
import { mapFormValuesToProgramInput, mapProgramToFormValues } from './programFormMapper';

describe('programFormMapper', () => {
  const program: TrainingProgram = {
    id: 'program-1',
    name: 'Hipertrofia',
    durationWeeks: 1,
    status: 'draft',
    blocks: [
      {
        id: 'block-1',
        name: 'Bloco 1',
        order: 1,
        type: 'accumulation',
        weeks: [
          {
            id: 'week-1',
            order: 1,
            isDeload: false,
            scheduledRoutines: [
              { weekday: 1, routineId: 'routine-push-a' },
              { weekday: 3, routineId: 'routine-pull-a' },
            ],
          },
        ],
      },
    ],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  it('maps scheduled routines into a 7-slot weekday array', () => {
    const formValues = mapProgramToFormValues(program);
    const week = formValues.blocks[0]!.weeks[0]!;
    expect(week.weekdayRoutineIds).toHaveLength(7);
    expect(week.weekdayRoutineIds[1]).toBe('routine-push-a');
    expect(week.weekdayRoutineIds[3]).toBe('routine-pull-a');
    expect(week.weekdayRoutineIds[0]).toBeNull();
  });

  it('round-trips back into the same scheduledRoutines shape', () => {
    const formValues = mapProgramToFormValues(program);
    const input = mapFormValuesToProgramInput(formValues);
    expect(input.blocks[0]!.weeks[0]!.scheduledRoutines).toEqual(
      program.blocks[0]!.weeks[0]!.scheduledRoutines,
    );
  });
});
