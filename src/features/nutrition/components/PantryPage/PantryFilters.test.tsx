import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { PantryFilters } from './PantryFilters';

describe('PantryFilters', () => {
  it('renders all 6 filters and marks the active one', () => {
    render(<PantryFilters value="vencendo" onChange={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Vencendo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the newly selected filter', () => {
    const onChange = vi.fn();
    render(<PantryFilters value="todos" onChange={onChange} />);
    screen.getByRole('button', { name: 'Estoque baixo' }).click();
    expect(onChange).toHaveBeenCalledWith('estoque-baixo');
  });
});
