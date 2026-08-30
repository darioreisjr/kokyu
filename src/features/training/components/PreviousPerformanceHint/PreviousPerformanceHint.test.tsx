import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { PerformedSet } from '../../types';
import { PreviousPerformanceHint } from './PreviousPerformanceHint';

describe('PreviousPerformanceHint', () => {
  it('shows a "no history" message when there is nothing to summarize', () => {
    render(<PreviousPerformanceHint performedSets={null} weightUnit="kg" />);
    expect(screen.getByText('Sem histórico anterior')).toBeInTheDocument();
  });

  it('summarizes only the completed weighted sets from the last session', () => {
    const performedSets: PerformedSet[] = [
      {
        id: 'ps-1',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 1,
        setType: 'working',
        weightKg: 80,
        reps: 8,
        completed: true,
      },
      {
        id: 'ps-2',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 2,
        setType: 'working',
        weightKg: 80,
        reps: 7,
        completed: true,
      },
      {
        id: 'ps-3',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 3,
        setType: 'working',
        weightKg: 80,
        reps: 8,
        completed: false,
      },
    ];
    render(<PreviousPerformanceHint performedSets={performedSets} weightUnit="kg" />);
    expect(screen.getByText('Último treino: 80kg×8, 80kg×7')).toBeInTheDocument();
  });

  it('falls back to a rep count for tracking types without a logged weight', () => {
    const performedSets: PerformedSet[] = [
      {
        id: 'ps-1',
        sessionId: 's0',
        sessionExerciseId: 'se0',
        setNumber: 1,
        setType: 'working',
        reps: 15,
        completed: true,
      },
    ];
    render(<PreviousPerformanceHint performedSets={performedSets} weightUnit="kg" />);
    expect(screen.getByText('Último treino: 15')).toBeInTheDocument();
  });
});
