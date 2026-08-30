import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { mockExercises } from '../../mocks/exercises.mock';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { ExercisePickerDialog } from './ExercisePickerDialog';

beforeEach(() => {
  resetTrainingDb();
});

describe('ExercisePickerDialog', () => {
  it('lists exercises and selects one, closing the dialog and clearing the search', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<ExercisePickerDialog open onClose={onClose} onSelect={onSelect} />);

    await waitFor(() => expect(screen.getByText('Supino reto')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar exercício'), 'Levantamento terra');
    await waitFor(() => expect(screen.queryByText('Supino reto')).not.toBeInTheDocument());

    await user.click(screen.getByText('Levantamento terra'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0]).toMatchObject({ id: 'exercise-levantamento-terra' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('excludes exercises already in the routine via excludeIds', async () => {
    render(
      <ExercisePickerDialog
        open
        onClose={() => {}}
        onSelect={() => {}}
        excludeIds={['exercise-supino-reto']}
      />,
    );

    await waitFor(() => expect(screen.getByText('Agachamento livre')).toBeInTheDocument());
    expect(screen.queryByText('Supino reto')).not.toBeInTheDocument();
  });

  it('shows an empty state when every exercise is excluded', async () => {
    render(
      <ExercisePickerDialog
        open
        onClose={() => {}}
        onSelect={() => {}}
        excludeIds={mockExercises.map((exercise) => exercise.id)}
      />,
    );

    expect(await screen.findByText('Nenhum exercício encontrado.')).toBeInTheDocument();
  });
});
