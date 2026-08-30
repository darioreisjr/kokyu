import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { TrainingProgram } from '../../types';
import { ProgramCard } from './ProgramCard';

const baseProgram: TrainingProgram = {
  id: 'program-1',
  name: 'Hipertrofia — Fundamentos',
  description: 'Push/Pull/Legs com foco em hipertrofia.',
  durationWeeks: 6,
  status: 'draft',
  blocks: [
    {
      id: 'block-1',
      name: 'Bloco 1 — Acumulação',
      order: 1,
      type: 'accumulation',
      weeks: [
        {
          id: 'week-1',
          order: 1,
          isDeload: false,
          scheduledRoutines: [{ weekday: 1, routineId: 'routine-push-a' }],
        },
        { id: 'week-2', order: 2, isDeload: false, scheduledRoutines: [] },
      ],
    },
  ],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('ProgramCard', () => {
  it('links to the program detail page and shows its status, duration and scheduled routine count', () => {
    render(<ProgramCard program={baseProgram} />);
    const link = screen.getByRole('link', { name: /Hipertrofia — Fundamentos/ });
    expect(link).toHaveAttribute('href', '/app/treinamento/programas/program-1');
    expect(screen.getByText('Rascunho')).toBeInTheDocument();
    expect(screen.getByText('6 semanas · 1 blocos · 1 treinos planejados')).toBeInTheDocument();
  });

  it('reflects an active program status with its status chip', () => {
    render(<ProgramCard program={{ ...baseProgram, status: 'active' }} />);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });
});
