import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { GoalFiltersBar } from './GoalFiltersBar';

describe('GoalFiltersBar', () => {
  it('reports a search change', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={onFiltersChange}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Buscar metas'), 'livros');
    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('toggles a quick filter on and off', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const { rerender } = render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={onFiltersChange}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Foco' }));
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ quickFilter: 'focus' }));

    rerender(
      <GoalFiltersBar
        filters={{ quickFilter: 'focus' }}
        onFiltersChange={onFiltersChange}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Foco' }));
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ quickFilter: undefined }),
    );
  });

  it('reports an area selection, and clearing it back to undefined', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={onFiltersChange}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Área'));
    await user.click(await screen.findByRole('option', { name: 'Tempo Livre' }));
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ area: 'leisure' }));
  });

  it('reports a priority selection', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={onFiltersChange}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Prioridade'));
    await user.click(await screen.findByRole('option', { name: 'Foco atual' }));
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ priority: 'focus' }));
  });

  it('reports a status selection', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={onFiltersChange}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Em risco' }));
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'atRisk' }));
  });

  it('reports a source selection', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={onFiltersChange}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Fonte'));
    await user.click(await screen.findByRole('option', { name: 'Automática' }));
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ source: 'automatic' }));
  });

  it('reports a sort change', async () => {
    const user = userEvent.setup();
    const onSortByChange = vi.fn();
    render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={vi.fn()}
        sortBy="priority"
        onSortByChange={onSortByChange}
      />,
    );

    await user.click(screen.getByLabelText('Ordenar por'));
    await user.click(await screen.findByRole('option', { name: 'Prazo' }));
    expect(onSortByChange).toHaveBeenCalledWith('deadline');
  });

  it('shows the view mode toggle only when a handler is given', () => {
    const { rerender } = render(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={vi.fn()}
        sortBy="priority"
        onSortByChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Cards' })).not.toBeInTheDocument();

    rerender(
      <GoalFiltersBar
        filters={{}}
        onFiltersChange={vi.fn()}
        sortBy="priority"
        onSortByChange={vi.fn()}
        viewMode="cards"
        onViewModeChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cards' })).toBeInTheDocument();
  });
});
