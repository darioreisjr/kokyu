import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { mockTrainingPreferences } from '../../mocks/trainingPreferences.mock';
import type { SessionExercise } from '../../types';
import { ActiveExerciseCard, type ActiveExerciseCardProps } from './ActiveExerciseCard';

const sessionExercise: SessionExercise = {
  id: 'se-1',
  sessionId: 'session-1',
  exerciseId: 'exercise-supino-reto',
  exerciseName: 'Supino reto',
  order: 1,
  sets: [
    { setNumber: 1, setType: 'warmup', targetReps: 10, targetLoadKg: 40, restSeconds: 60 },
    {
      setNumber: 2,
      setType: 'working',
      targetReps: 6,
      targetRepsMax: 8,
      targetLoadKg: 70,
      restSeconds: 120,
    },
  ],
};

function renderCard(overrides: Partial<ActiveExerciseCardProps> = {}) {
  const props: ActiveExerciseCardProps = {
    sessionExercise,
    performedSets: [],
    previousPerformedSets: null,
    preferences: mockTrainingPreferences,
    groupedCount: 1,
    onLogSet: vi.fn(),
    onAddSet: vi.fn(),
    onRemoveExercise: vi.fn(),
    onSubstitute: vi.fn(),
    onNotesChange: vi.fn(),
    onOpenPlateCalculator: vi.fn(),
    onOpenWarmupCalculator: vi.fn(),
    ...overrides,
  };
  render(<ActiveExerciseCard {...props} />);
  return props;
}

describe('ActiveExerciseCard', () => {
  it('renders the exercise name, one row per prescribed set, and no superset chip when standalone', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Supino reto' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Concluir série' })).toHaveLength(2);
    expect(screen.queryByText('Superset')).not.toBeInTheDocument();
  });

  it('shows a "Superset" chip when grouped with other exercises', () => {
    renderCard({ groupedCount: 2 });
    expect(screen.getByText('Superset')).toBeInTheDocument();
  });

  it('opens the plate and warmup calculators pre-filled with the first working set target', async () => {
    const user = userEvent.setup();
    const props = renderCard();
    await user.click(screen.getByRole('button', { name: 'Anilhas' }));
    expect(props.onOpenPlateCalculator).toHaveBeenCalledWith(70);
    await user.click(screen.getByRole('button', { name: 'Aquecimento' }));
    expect(props.onOpenWarmupCalculator).toHaveBeenCalledWith(70, 6);
  });

  it('adds a set and removes/substitutes the exercise via their respective buttons', async () => {
    const user = userEvent.setup();
    const props = renderCard();
    await user.click(screen.getByRole('button', { name: 'Adicionar série' }));
    expect(props.onAddSet).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Substituir' }));
    expect(props.onSubstitute).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Remover' }));
    expect(props.onRemoveExercise).toHaveBeenCalledTimes(1);
  });
});
