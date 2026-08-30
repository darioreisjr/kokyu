import { describe, expect, it } from 'vitest';

import { formatGoalDeadline, formatGoalProgressAccessibleLabel } from './goalFormatting';

const now = new Date('2026-06-15T00:00:00');

describe('formatGoalDeadline', () => {
  it('shows "Sem prazo" when there is no target date', () => {
    expect(formatGoalDeadline(undefined, now)).toBe('Sem prazo');
  });

  it('shows the number of days remaining', () => {
    expect(formatGoalDeadline('2026-06-25', now)).toBe('Faltam 10 dias');
  });

  it('uses the singular form for exactly one day left', () => {
    expect(formatGoalDeadline('2026-06-16', now)).toBe('Falta 1 dia');
  });

  it('says the deadline is today', () => {
    expect(formatGoalDeadline('2026-06-15', now)).toBe('Prazo é hoje');
  });

  it('never uses punitive language for a passed deadline', () => {
    expect(formatGoalDeadline('2026-06-01', now)).toBe('Prazo ultrapassado');
  });
});

describe('formatGoalProgressAccessibleLabel', () => {
  it('formats a whole-number progress sentence', () => {
    expect(formatGoalProgressAccessibleLabel(8, 20, 'books', 40)).toBe(
      'Progresso: 8 de 20 livros, 40%.',
    );
  });

  it('uses the singular unit form when the target is 1', () => {
    expect(formatGoalProgressAccessibleLabel(1, 1, 'books', 100)).toBe(
      'Progresso: 1 de 1 livro, 100%.',
    );
  });

  it('rounds fractional values to one decimal place', () => {
    expect(formatGoalProgressAccessibleLabel(15.456, 30, 'minutes', 52)).toBe(
      'Progresso: 15.5 de 30 minutos, 52%.',
    );
  });
});
