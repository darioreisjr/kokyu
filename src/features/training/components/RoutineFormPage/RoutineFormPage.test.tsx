import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { routineService } from '../../services/routineService';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { RoutineFormPage } from './RoutineFormPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  resetTrainingDb();
  mockPush.mockClear();
});

describe('RoutineFormPage — create', () => {
  it('creates a routine with a name and one exercise added through the picker, then navigates to it', async () => {
    const user = userEvent.setup();
    render(<RoutineFormPage mode="create" />);

    expect(screen.getByRole('heading', { name: 'Novo treino' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^nome/i), 'Treino de teste');

    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.type(screen.getByLabelText('Buscar exercício'), 'Supino reto');
    await user.click(screen.getByRole('button', { name: /Supino reto/ }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Criar treino' }));

    await waitFor(async () => {
      const routines = await routineService.getRoutines({ includeArchived: true });
      expect(routines.some((routine) => routine.name === 'Treino de teste')).toBe(true);
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
  });
});

describe('RoutineFormPage — edit', () => {
  it('pre-fills the builder with the existing routine and shows the edit heading and submit label', async () => {
    render(<RoutineFormPage mode="edit" routineId="routine-push-a" />);

    expect(await screen.findByRole('heading', { name: 'Editar Push A' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^nome/i)).toHaveValue('Push A');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument();
  });

  it('shows a not-found message for an unknown routine id instead of crashing', async () => {
    render(<RoutineFormPage mode="edit" routineId="routine-does-not-exist" />);

    expect(await screen.findByText('Treino não encontrado.')).toBeInTheDocument();
  });
});
