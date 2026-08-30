import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { render, screen } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { GoalEditPage } from './GoalEditPage';

beforeEach(() => {
  resetGoalDb();
  mockPush.mockClear();
});

describe('GoalEditPage', () => {
  it('loads the goal and shows the edit form pre-filled with its title', async () => {
    render(<GoalEditPage goalId="goal-read-20-books" />);
    expect(
      await screen.findByRole('heading', { name: 'Editar meta', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Ler 20 livros este ano');
  });

  it('shows an error state for a goal that does not exist', async () => {
    render(<GoalEditPage goalId="goal-does-not-exist" />);
    expect(
      await screen.findByText('Não foi possível carregar esta meta agora. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
