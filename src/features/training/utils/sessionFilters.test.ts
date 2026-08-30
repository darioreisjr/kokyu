import { describe, expect, it } from 'vitest';

import type { WorkoutSession } from '../types';
import { groupSessionsByRecency } from './sessionFilters';

function session(id: string, startedAt: string): WorkoutSession {
  return {
    id,
    name: id,
    startedAt,
    status: 'completed',
    sessionExercises: [],
    createdAt: startedAt,
    updatedAt: startedAt,
  };
}

describe('groupSessionsByRecency', () => {
  // Saturday, so "Esta semana" (Monday-anchored) only covers back to Monday 24th.
  const now = new Date('2026-08-29T18:00:00.000Z');

  it('buckets a same-day session as Hoje', () => {
    const groups = groupSessionsByRecency([session('a', '2026-08-29T08:00:00.000Z')], now);
    expect(groups).toEqual([{ label: 'Hoje', sessions: [expect.objectContaining({ id: 'a' })] }]);
  });

  it('buckets an earlier-this-week session as Esta semana', () => {
    const groups = groupSessionsByRecency([session('a', '2026-08-25T08:00:00.000Z')], now);
    expect(groups[0]!.label).toBe('Esta semana');
  });

  it('buckets an earlier-this-month session as Este mês', () => {
    const groups = groupSessionsByRecency([session('a', '2026-08-03T08:00:00.000Z')], now);
    expect(groups[0]!.label).toBe('Este mês');
  });

  it('buckets an older session as Anteriores', () => {
    const groups = groupSessionsByRecency([session('a', '2026-06-01T08:00:00.000Z')], now);
    expect(groups[0]!.label).toBe('Anteriores');
  });

  it('omits empty groups entirely', () => {
    const groups = groupSessionsByRecency([session('a', '2026-08-29T08:00:00.000Z')], now);
    expect(groups).toHaveLength(1);
  });
});
