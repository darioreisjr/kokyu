import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { goalService } from '../../services/goalService';
import { GoalDetailPage } from './GoalDetailPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  resetGoalDb();
  mockPush.mockClear();
});

describe('GoalDetailPage', () => {
  it('shows the goal title, status and progress caption', async () => {
    render(<GoalDetailPage goalId="goal-read-20-books" />);
    expect(
      await screen.findByRole('heading', { name: 'Ler 20 livros este ano', level: 1 }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Progresso: 8 de 20 livros, 40%.')).toBeInTheDocument();
    expect(screen.getByText('Atualizado automaticamente pelo Kokyu.')).toBeInTheDocument();
  });

  it('records a manual progress update and reflects it without overwriting history', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Atualizar progresso' }));
    const valueField = await screen.findByLabelText(/Novo valor/);
    await user.clear(valueField);
    await user.type(valueField, '120');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(async () => {
      const entries = await goalService.getGoalProgress('goal-reduce-screen-time');
      expect(entries.some((entry) => entry.value === 120)).toBe(true);
    });
  });

  it('lets the user complete a milestone', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-build-app" />);
    await screen.findByRole('heading', { name: 'Construir meu aplicativo pessoal', level: 1 });

    const checkbox = screen.getByRole('checkbox', { name: /Implementar as telas principais/ });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    await waitFor(async () => {
      const goal = await goalService.getGoal('goal-build-app');
      expect(
        goal?.milestones?.find((milestone) => milestone.title === 'Implementar as telas principais')
          ?.completed,
      ).toBe(true);
    });
  });

  it('registers a check-in', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-train-4x-week" />);
    await screen.findByRole('heading', { name: 'Treinar 4 vezes por semana', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Fazer check-in' }));
    await user.click(await screen.findByRole('button', { name: 'No ritmo' }));
    await user.click(screen.getByRole('button', { name: 'Salvar check-in' }));

    await waitFor(async () => {
      const checkIns = await goalService.getCheckIns('goal-train-4x-week');
      expect(checkIns.length).toBeGreaterThan(0);
    });
  });

  it('pauses and resumes a goal from the actions menu', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-train-4x-week" />);
    await screen.findByRole('heading', { name: 'Treinar 4 vezes por semana', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Pausar' }));
    await waitFor(async () =>
      expect((await goalService.getGoal('goal-train-4x-week'))?.status).toBe('paused'),
    );

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Retomar' }));
    await waitFor(async () =>
      expect((await goalService.getGoal('goal-train-4x-week'))?.status).not.toBe('paused'),
    );
  });

  it('replans the deadline with a note', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Replanejar' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Sem prazo' }));
    await user.click(screen.getByRole('button', { name: 'Replanejar' }));

    await waitFor(async () =>
      expect((await goalService.getGoal('goal-reduce-screen-time'))?.targetDate).toBeUndefined(),
    );
  });

  it('completes a goal without a reflection', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Concluir' }));
    await user.click(await screen.findByRole('button', { name: 'Concluir sem reflexão' }));

    await waitFor(async () =>
      expect((await goalService.getGoal('goal-reduce-screen-time'))?.status).toBe('completed'),
    );
  });

  it('ends a goal as abandoned with a reason', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Encerrar' }));
    await user.click(await screen.findByRole('radio', { name: 'Não faz mais sentido' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(async () =>
      expect((await goalService.getGoal('goal-reduce-screen-time'))?.status).toBe('abandoned'),
    );
  });

  it('archives a goal after confirming', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Arquivar' }));
    await user.click(await screen.findByRole('button', { name: 'Arquivar' }));

    await waitFor(async () =>
      expect((await goalService.getGoal('goal-reduce-screen-time'))?.status).toBe('archived'),
    );
  });

  it('deletes a goal after confirming and navigates back to Em andamento', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));
    await user.click(await screen.findByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/app/metas/em-andamento'));
    await waitFor(async () =>
      expect(await goalService.getGoal('goal-reduce-screen-time')).toBeNull(),
    );
  });

  it('duplicates a goal and navigates to the copy', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Duplicar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(mockPush.mock.calls[0]![0] as string).toMatch(/^\/app\/metas\/goal-/);
  });

  it('adds a note', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-reduce-screen-time" />);
    await screen.findByRole('heading', { name: 'Reduzir tempo de tela diário', level: 1 });

    await user.type(screen.getByLabelText('Nova nota'), 'Uma observação qualquer');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(async () => {
      const notes = await goalService.getGoalNotes('goal-reduce-screen-time');
      expect(notes.some((note) => note.text === 'Uma observação qualquer')).toBe(true);
    });
  });

  it('updates a key result value', async () => {
    const user = userEvent.setup();
    render(<GoalDetailPage goalId="goal-improve-career" />);
    await screen.findByRole('heading', { name: 'Melhorar minha carreira', level: 1 });

    const inputs = await screen.findAllByLabelText('Valor atual');
    await user.clear(inputs[0]!);
    await user.type(inputs[0]!, '2');
    const updateButtons = screen.getAllByRole('button', { name: 'Atualizar' });
    await user.click(updateButtons[0]!);

    await waitFor(async () => {
      const goal = await goalService.getGoal('goal-improve-career');
      expect(goal?.keyResults?.[0]?.current).toBe(2);
    });
  });

  it('shows an error state for a goal that does not exist', async () => {
    render(<GoalDetailPage goalId="goal-does-not-exist" />);
    expect(
      await screen.findByText('Não foi possível carregar esta meta agora. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
