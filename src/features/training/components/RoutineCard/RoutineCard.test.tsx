import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { mockRoutinePushA } from '../../mocks/routines.mock';
import { RoutineCard } from './RoutineCard';

describe('RoutineCard', () => {
  it('links to the routine detail page and shows its exercise count, duration and muscle groups', () => {
    render(<RoutineCard routine={mockRoutinePushA} />);
    expect(screen.getByRole('link', { name: /Push A/ })).toHaveAttribute(
      'href',
      '/app/treinamento/treinos/routine-push-a',
    );
    expect(screen.getByText(/4 exercícios/)).toBeInTheDocument();
    expect(screen.getByText(/1h/)).toBeInTheDocument();
    expect(screen.getByText('Peito')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when the favorite button is clicked, without navigating', async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    render(<RoutineCard routine={mockRoutinePushA} onToggleFavorite={onToggleFavorite} />);
    await user.click(screen.getByRole('button', { name: 'Remover dos favoritos' }));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('reflects a non-favorited routine with an accessible label', () => {
    render(
      <RoutineCard
        routine={{ ...mockRoutinePushA, favorite: false }}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Adicionar aos favoritos' })).toBeInTheDocument();
  });

  it('shows an "Arquivada" chip for an archived routine and hides the favorite button when no handler is passed', () => {
    render(<RoutineCard routine={{ ...mockRoutinePushA, archived: true }} />);
    expect(screen.getByText('Arquivada')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
