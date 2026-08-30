import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetTrainingDb, trainingDb } from '../../services/trainingMockDb';
import { ProgramFormPage } from './ProgramFormPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('ProgramFormPage — create', () => {
  beforeEach(() => {
    resetTrainingDb();
    mockPush.mockClear();
  });

  it('shows the "Novo programa" heading and an empty form ready to fill', () => {
    render(<ProgramFormPage mode="create" />);
    expect(screen.getByRole('heading', { name: 'Novo programa' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^nome \*/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Criar programa' })).toBeInTheDocument();
  });

  it('creates a program with a block and a week, then navigates to its detail page', async () => {
    const user = userEvent.setup();
    render(<ProgramFormPage mode="create" />);

    await user.type(screen.getByLabelText(/^nome \*/i), 'Programa de teste');
    await user.click(screen.getByRole('button', { name: 'Adicionar bloco' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar semana' }));
    await user.click(screen.getByLabelText('Seg'));
    await user.click(await screen.findByRole('option', { name: 'Push A' }));

    await user.click(screen.getByRole('button', { name: 'Criar programa' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    const created = trainingDb.programs.find((program) => program.name === 'Programa de teste');
    expect(created).toBeDefined();
    expect(created?.blocks[0]?.weeks[0]?.scheduledRoutines).toEqual([
      { weekday: 1, routineId: 'routine-push-a' },
    ]);
    expect(mockPush).toHaveBeenCalledWith(`/app/treinamento/programas/${created!.id}`);
  });
});

describe('ProgramFormPage — edit', () => {
  beforeEach(() => {
    resetTrainingDb();
    mockPush.mockClear();
  });

  it('loads the existing program into the form for editing', async () => {
    render(<ProgramFormPage mode="edit" programId="program-hipertrofia-fundamentos" />);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Editar Hipertrofia — Fundamentos' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/^nome \*/i)).toHaveValue('Hipertrofia — Fundamentos');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument();
  });

  it('shows a not-found message for an unknown program id', async () => {
    render(<ProgramFormPage mode="edit" programId="does-not-exist" />);
    await waitFor(() => expect(screen.getByText('Programa não encontrado.')).toBeInTheDocument());
  });
});
