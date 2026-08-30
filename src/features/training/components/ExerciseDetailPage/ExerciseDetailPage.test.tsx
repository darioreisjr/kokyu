import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { exerciseService } from '../../services/exerciseService';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { ExerciseDetailPage } from './ExerciseDetailPage';

beforeEach(() => {
  resetTrainingDb();
});

describe('ExerciseDetailPage', () => {
  it('shows the exercise name, type, muscles and a link back to the library', async () => {
    render(<ExerciseDetailPage exerciseId="exercise-supino-reto" />);
    expect(
      await screen.findByRole('heading', { name: 'Supino reto', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Força')).toBeInTheDocument();
    expect(screen.getByText('Peito')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para Exercícios' })).toHaveAttribute(
      'href',
      '/app/treinamento/exercicios',
    );
  });

  it('toggles the favorite state via the service when the favorite button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExerciseDetailPage exerciseId="exercise-supino-reto" />);
    const favoriteButton = await screen.findByRole('button', { name: 'Adicionar aos favoritos' });

    await user.click(favoriteButton);

    expect(
      await screen.findByRole('button', { name: 'Remover dos favoritos' }),
    ).toBeInTheDocument();
    await waitFor(async () => {
      const exercise = await exerciseService.getExercise('exercise-supino-reto');
      expect(exercise?.favorite).toBe(true);
    });
  });

  it('shows an empty state when the exercise id does not exist', async () => {
    render(<ExerciseDetailPage exerciseId="exercise-does-not-exist" />);
    expect(await screen.findByText('Exercício não encontrado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para Exercícios' })).toHaveAttribute(
      'href',
      '/app/treinamento/exercicios',
    );
  });

  it('shows the empty-history and empty-records messaging for an exercise with no logged sets', async () => {
    render(<ExerciseDetailPage exerciseId="exercise-supino-halteres" />);
    await screen.findByRole('heading', { name: 'Supino com halteres', level: 1 });
    expect(
      screen.getByText('Ainda sem recordes registrados para este exercício.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Você ainda não treinou este exercício.')).toBeInTheDocument();
    expect(
      screen.getByText('Este exercício ainda não tem instruções cadastradas.'),
    ).toBeInTheDocument();
  });
});
