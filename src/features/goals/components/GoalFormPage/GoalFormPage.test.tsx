import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { goalService } from '../../services/goalService';
import { GoalFormPage } from './GoalFormPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  resetGoalDb();
  mockPush.mockClear();
});

describe('GoalFormPage — manual numeric goal', () => {
  it('creates a numeric goal by walking every step', async () => {
    const user = userEvent.setup();
    render(<GoalFormPage mode="create" />);

    await user.type(screen.getByLabelText('Título'), 'Estudar espanhol');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Etapa 2 — área (default "Pessoal" is fine, just continue)
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Etapa 3 — tipo (default "Número" is fine)
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Etapa 4 — configurar medição
    const targetField = screen.getByLabelText('Alvo');
    await user.clear(targetField);
    await user.type(targetField, '100');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Etapa 5 — quando (data inicial já vem preenchida com hoje)
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Etapa 6 — acompanhamento (default manual)
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Etapa 7 — detalhes finais + submit
    await user.click(screen.getByRole('button', { name: 'Criar meta' }));

    await waitFor(async () => {
      const goals = await goalService.getGoals();
      expect(goals.some((goal) => goal.title === 'Estudar espanhol')).toBe(true);
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
  });
});

describe('GoalFormPage — automatic source', () => {
  it('lets the user pick Tempo Livre → Livros concluídos as the progress source', async () => {
    const user = userEvent.setup();
    render(<GoalFormPage mode="create" />);

    await user.type(screen.getByLabelText('Título'), 'Ler 20 livros este ano');
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> área
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> tipo (Número)
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> configurar medição
    await user.clear(screen.getByLabelText('Alvo'));
    await user.type(screen.getByLabelText('Alvo'), '20');
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> quando
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> acompanhamento

    await user.click(screen.getByLabelText('Atualização'));
    await user.click(
      await screen.findByRole('option', { name: 'Automaticamente, vinculado a um módulo Kokyu' }),
    );

    await user.click(screen.getByLabelText('Fonte'));
    await user.click(await screen.findByRole('option', { name: 'Tempo Livre' }));

    await user.click(screen.getByLabelText('Métrica'));
    await user.click(await screen.findByRole('option', { name: 'Livros concluídos' }));

    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Criar meta' }));

    await waitFor(async () => {
      const goals = await goalService.getGoals();
      const created = goals.find((goal) => goal.title === 'Ler 20 livros este ano');
      expect(created?.progressMode).toBe('automatic');
      expect(created?.source).toEqual({ module: 'leisure', metricId: 'leisure.booksCompleted' });
    });
  });
});
