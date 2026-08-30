import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { exerciseService } from '../../services/exerciseService';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { ExerciseFormDialog } from './ExerciseFormDialog';

const equipmentOptions = [
  { value: 'equipment-barra', label: 'Barra' },
  { value: 'equipment-halteres', label: 'Halteres' },
];

beforeEach(() => {
  resetTrainingDb();
});

describe('ExerciseFormDialog', () => {
  it('creates a custom exercise and calls onCreated with it', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onClose = vi.fn();
    render(
      <ExerciseFormDialog
        open
        onClose={onClose}
        onCreated={onCreated}
        equipmentOptions={equipmentOptions}
      />,
    );

    await user.type(screen.getByLabelText('Nome *'), 'Remada unilateral');

    await user.click(screen.getByLabelText('Músculos principais'));
    await user.click(await screen.findByRole('option', { name: 'Costas' }));
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Criar exercício' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    expect(onCreated.mock.calls[0]![0]).toMatchObject({
      name: 'Remada unilateral',
      primaryMuscles: ['back'],
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    const created = await exerciseService.getExercises({ createdByUserOnly: true });
    expect(created.some((exercise) => exercise.name === 'Remada unilateral')).toBe(true);
  });

  it('shows a validation error and does not submit when no primary muscle is selected', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    render(
      <ExerciseFormDialog
        open
        onClose={() => {}}
        onCreated={onCreated}
        equipmentOptions={equipmentOptions}
      />,
    );

    await user.type(screen.getByLabelText('Nome *'), 'Exercício sem músculo');
    await user.click(screen.getByRole('button', { name: 'Criar exercício' }));

    expect(await screen.findByText('Selecione ao menos um músculo principal')).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('renders nothing visible when closed', () => {
    render(
      <ExerciseFormDialog
        open={false}
        onClose={() => {}}
        onCreated={() => {}}
        equipmentOptions={equipmentOptions}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
