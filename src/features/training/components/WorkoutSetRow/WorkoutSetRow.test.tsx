import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { PerformedSet, SessionExercisePrescriptionSnapshot } from '../../types';
import { WorkoutSetRow } from './WorkoutSetRow';

const prescription: SessionExercisePrescriptionSnapshot = {
  setNumber: 2,
  setType: 'working',
  targetReps: 6,
  targetRepsMax: 8,
  targetLoadKg: 70,
  restSeconds: 120,
};

const previousSet: PerformedSet = {
  id: 'ps-previous',
  sessionId: 'session-previous',
  sessionExerciseId: 'se-previous',
  setNumber: 2,
  setType: 'working',
  weightKg: 70,
  reps: 7,
  completed: true,
};

describe('WorkoutSetRow', () => {
  it('shows the set label, previous performance, and prefilled target values', () => {
    render(
      <WorkoutSetRow
        prescription={prescription}
        performedSet={undefined}
        previousSet={previousSet}
        weightUnit="kg"
        showRpeRir
        onLog={vi.fn()}
      />,
    );
    expect(screen.getByText('Trabalho 2')).toBeInTheDocument();
    expect(screen.getByText('70kg×7')).toBeInTheDocument();
    expect(screen.getByLabelText('Peso, série 2')).toHaveValue(70);
    expect(screen.getByLabelText('Repetições, série 2')).toHaveValue(6);
    expect(screen.getByLabelText('RIR, série 2')).toBeInTheDocument();
  });

  it('logs the current weight/reps and marks the set complete when the check button is clicked', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    render(
      <WorkoutSetRow
        prescription={prescription}
        performedSet={undefined}
        previousSet={undefined}
        weightUnit="kg"
        showRpeRir={false}
        onLog={onLog}
      />,
    );
    await user.clear(screen.getByLabelText('Peso, série 2'));
    await user.type(screen.getByLabelText('Peso, série 2'), '72.5');
    await user.clear(screen.getByLabelText('Repetições, série 2'));
    await user.type(screen.getByLabelText('Repetições, série 2'), '7');
    await user.click(screen.getByRole('button', { name: 'Concluir série' }));
    expect(onLog).toHaveBeenCalledWith({
      setType: 'working',
      weightKg: 72.5,
      reps: 7,
      rir: undefined,
      completed: true,
    });
  });

  it('hides the RIR field when showRpeRir is false, and reflects the completed state accessibly', () => {
    render(
      <WorkoutSetRow
        prescription={prescription}
        performedSet={{
          id: 'ps-1',
          sessionId: 's',
          sessionExerciseId: 'se',
          setNumber: 2,
          setType: 'working',
          weightKg: 72.5,
          reps: 7,
          completed: true,
        }}
        previousSet={undefined}
        weightUnit="kg"
        showRpeRir={false}
        onLog={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('RIR, série 2')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Marcar série como não concluída' }),
    ).toBeInTheDocument();
  });
});
