import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { exerciseService } from '../../services/exerciseService';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { ExerciseLibraryPage } from './ExerciseLibraryPage';

beforeEach(() => {
  resetTrainingDb();
});

describe('ExerciseLibraryPage', () => {
  it('shows the header and the seeded exercises once loaded', async () => {
    render(<ExerciseLibraryPage />);
    expect(screen.getByRole('heading', { name: 'Exercícios', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Supino reto')).toBeInTheDocument();
    expect(screen.getByText('Agachamento livre')).toBeInTheDocument();
  });

  it('filters the list down to a single exercise when searching', async () => {
    const user = userEvent.setup();
    render(<ExerciseLibraryPage />);
    await screen.findByText('Supino reto');

    await user.type(screen.getByLabelText('Buscar exercícios'), 'Levantamento terra');

    await waitFor(() => expect(screen.queryByText('Supino reto')).not.toBeInTheDocument());
    expect(screen.getByText('Levantamento terra')).toBeInTheDocument();
  });

  it('shows an empty state with a call to action when no exercise matches the search', async () => {
    const user = userEvent.setup();
    render(<ExerciseLibraryPage />);
    await screen.findByText('Supino reto');

    await user.type(screen.getByLabelText('Buscar exercícios'), 'exercicio-que-nao-existe');

    expect(await screen.findByText('Nenhum exercício encontrado.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Novo exercício' }).length).toBeGreaterThan(0);
  });

  it('opens the create-exercise dialog, submits it, and reflects the new exercise in the list', async () => {
    const user = userEvent.setup();
    render(<ExerciseLibraryPage />);
    await screen.findByText('Supino reto');

    await user.click(screen.getAllByRole('button', { name: 'Novo exercício' })[0]!);
    expect(screen.getByRole('dialog', { name: 'Novo exercício' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome *'), 'Exercício de teste');
    await user.click(screen.getByLabelText('Músculos principais'));
    await user.click(await screen.findByRole('option', { name: 'Peito' }));
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Criar exercício' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Exercício de teste')).toBeInTheDocument();

    const created = await exerciseService.getExercises({ createdByUserOnly: true });
    expect(created.some((exercise) => exercise.name === 'Exercício de teste')).toBe(true);
  });
});
