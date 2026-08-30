import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { Exercise } from '../../types';
import { ExerciseCard } from './ExerciseCard';

const exercise: Exercise = {
  id: 'exercise-supino-reto',
  name: 'Supino reto',
  slug: 'supino-reto',
  exerciseType: 'strength',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['triceps'],
  equipmentIds: ['equipment-barra'],
  trackingType: 'weightReps',
  createdByUser: false,
  favorite: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('ExerciseCard', () => {
  it('links to the exercise detail page and shows its type and primary muscles', () => {
    render(<ExerciseCard exercise={exercise} equipmentNames={['Barra']} />);
    expect(screen.getByRole('link', { name: /Supino reto/ })).toHaveAttribute(
      'href',
      '/app/treinamento/exercicios/exercise-supino-reto',
    );
    expect(screen.getByText(/Força · Peito/)).toBeInTheDocument();
    expect(screen.getByText('Barra')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when the favorite button is clicked, without navigating', async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    render(<ExerciseCard exercise={exercise} onToggleFavorite={onToggleFavorite} />);
    await user.click(screen.getByRole('button', { name: 'Adicionar aos favoritos' }));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('reflects the favorited state with an accessible label', () => {
    render(<ExerciseCard exercise={{ ...exercise, favorite: true }} onToggleFavorite={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toBeInTheDocument();
  });
});
